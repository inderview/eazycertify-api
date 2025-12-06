import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository, FilterQuery } from '@mikro-orm/postgresql'
import { Purchase } from './purchase.entity'
import { PurchaseDevice } from './purchase-device.entity'
import { PurchaseAuditLog } from './purchase-audit-log.entity'

export interface LockedAccountsFilters {
  examId?: number
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: EntityRepository<Purchase>,
    @InjectRepository(PurchaseDevice)
    private readonly purchaseDeviceRepository: EntityRepository<PurchaseDevice>,
    @InjectRepository(PurchaseAuditLog)
    private readonly auditLogRepository: EntityRepository<PurchaseAuditLog>,
  ) {}

  async checkAccess(userId: string, examId: number, deviceFingerprint?: string): Promise<boolean> {
    const purchase = await this.purchaseRepository.findOne({
      userId,
      exam: { id: examId },
      expiresAt: { $gt: new Date() },
    })

    if (!purchase) {
      return false
    }

    // If device fingerprint is provided, validate it
    if (deviceFingerprint) {
      await this.validateDeviceAccess(purchase, deviceFingerprint)
    }

    return true
  }

  async validateDeviceAccess(purchase: Purchase, deviceFingerprint: string): Promise<void> {
    let deviceRecord = await this.purchaseDeviceRepository.findOne({ purchase })

    // Story 1: Capture First Machine
    if (!deviceRecord) {
      deviceRecord = this.purchaseDeviceRepository.create({
        purchase,
        deviceFingerprint,
        isLocked: false,
        lastAccessedAt: new Date(),
        createdAt: new Date(),
      })
      await this.purchaseDeviceRepository.getEntityManager().persistAndFlush(deviceRecord)
      return
    }

    // Story 3: Check if already locked
    if (deviceRecord.isLocked) {
      // Check if lock has expired (48 hours)
      if (deviceRecord.lockedAt) {
        const lockExpiry = new Date(deviceRecord.lockedAt.getTime() + 48 * 60 * 60 * 1000); // 48 hours
        if (new Date() > lockExpiry) {
          // Auto-unlock after 48 hours
          deviceRecord.isLocked = false;
          deviceRecord.lockReason = undefined;
          deviceRecord.lockedAt = undefined;
          await this.purchaseDeviceRepository.getEntityManager().flush();
          
          // Create audit log for auto-unlock
          await this.createAuditLog(purchase, 'auto_unlocked', undefined, '48-hour lock period expired');
        } else {
          throw new ForbiddenException('Access locked. Please contact support.');
        }
      } else {
        throw new ForbiddenException('Access locked. Please contact support.');
      }
    }

    // Story 2: Compare Device
    if (deviceRecord.deviceFingerprint !== deviceFingerprint) {
      // Scenario B: Different machine -> Auto-lock
      deviceRecord.isLocked = true;
      deviceRecord.lockReason = `Attempted access from different device: ${deviceFingerprint}`;
      deviceRecord.lockedAt = new Date(); // Set lock timestamp
      await this.purchaseDeviceRepository.getEntityManager().flush();
      
      // Create audit log for auto-lock
      await this.createAuditLog(purchase, 'locked', undefined, deviceRecord.lockReason)
      
      throw new ForbiddenException('Your course access has been locked because you tried to access from a different device.')
    }

    // Scenario A: Same machine -> Update last access
    deviceRecord.lastAccessedAt = new Date()
    await this.purchaseDeviceRepository.getEntityManager().flush()
    await this.purchaseDeviceRepository.getEntityManager().flush()
  }

  async getAllPurchasesDebug() {
    return this.purchaseRepository.findAll({ populate: ['exam'] })
  }

  async getUserPurchases(userId: string, email?: string) {
    const where: FilterQuery<Purchase> = {
      $or: [{ userId }]
    }

    if (email) {
      where.$or!.push({ userEmail: email })
    }

    const purchases = await this.purchaseRepository.find(
      where,
      { populate: ['exam'] },
    )
    
    return purchases.map(p => ({
      id: p.id,
      examId: p.exam.id,
      examCode: p.exam.code,
      examTitle: p.exam.title,
      expiresAt: p.expiresAt,
      createdAt: p.createdAt,
      amount: p.amount,
      status: p.expiresAt > new Date() ? 'Active' : 'Inactive'
    }))
  }

  // Story 4: Admin Unlock with audit logging
  async unlockPurchase(purchaseId: number, adminEmail?: string, ipAddress?: string): Promise<void> {
    const deviceRecord = await this.purchaseDeviceRepository.findOne(
      { purchase: { id: purchaseId } },
      { populate: ['purchase'] }
    )
    
    if (!deviceRecord) {
      throw new NotFoundException('Purchase device record not found')
    }

    const previousState = deviceRecord.lockReason;
    deviceRecord.isLocked = false;
    deviceRecord.lockReason = undefined;
    deviceRecord.lockedAt = undefined; // Clear lock timestamp
    await this.purchaseDeviceRepository.getEntityManager().flush();
    
    // Create audit log for unlock action
    await this.createAuditLog(
      deviceRecord.purchase,
      'unlocked',
      adminEmail,
      `Admin unlocked account. Previous reason: ${previousState || 'N/A'}`,
      ipAddress
    )
  }

  // Fetch all locked accounts with pagination and filters
  async getLockedAccounts(
    page: number = 1,
    pageSize: number = 20,
    filters?: LockedAccountsFilters
  ): Promise<PaginatedResult<any>> {
    try {
      const where: FilterQuery<PurchaseDevice> = { isLocked: true }
      
      // Apply filters
      if (filters?.examId) {
        where.purchase = { exam: { id: filters.examId } }
      }
      
      if (filters?.dateFrom || filters?.dateTo) {
        where.createdAt = {}
        if (filters.dateFrom) {
          where.createdAt.$gte = filters.dateFrom
        }
        if (filters.dateTo) {
          where.createdAt.$lte = filters.dateTo
        }
      }
      
      if (filters?.search) {
        if (where.purchase) {
          (where.purchase as any).userId = { $like: `%${filters.search}%` }
        } else {
          where.purchase = { userId: { $like: `%${filters.search}%` } }
        }
      }

      const [lockedDevices, total] = await this.purchaseDeviceRepository.findAndCount(
        where,
        { 
          populate: ['purchase', 'purchase.exam'],
          limit: pageSize,
          offset: (page - 1) * pageSize,
          orderBy: { createdAt: 'DESC' }
        }
      )

      // If no locked devices found, return empty result
      if (!lockedDevices || lockedDevices.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0
        }
      }

      const data = lockedDevices.map(device => ({
        id: device.purchase.id,
        userId: device.purchase.userId,
        examId: device.purchase.exam.id,
        examCode: device.purchase.exam.code,
        examTitle: device.purchase.exam.title,
        deviceFingerprint: device.deviceFingerprint,
        lockReason: device.lockReason,
        lockedAt: device.lockedAt || device.createdAt, // Use lockedAt if available
        lastAccessedAt: device.lastAccessedAt,
      }));

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    } catch (error: any) {
      console.error('Error in getLockedAccounts:', error);
      // Return empty result on error to prevent 500
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      }
    }
  }

  // Get access history for a purchase
  async getAccessHistory(purchaseId: number) {
    const logs = await this.auditLogRepository.find(
      { purchase: { id: purchaseId } },
      { orderBy: { createdAt: 'DESC' } }
    )

    return logs.map(log => ({
      id: log.id,
      action: log.action,
      adminEmail: log.adminEmail,
      reason: log.reason,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt
    }))
  }

  // Create audit log entry
  private async createAuditLog(
    purchase: Purchase,
    action: string,
    adminEmail?: string,
    reason?: string,
    ipAddress?: string,
    metadata?: any
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      purchase,
      action,
      adminEmail,
      reason,
      ipAddress,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      createdAt: new Date()
    })

    await this.auditLogRepository.getEntityManager().persistAndFlush(auditLog)
  }
}
