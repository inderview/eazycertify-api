import { Controller, Get, Query, UseGuards, Req, Param, Ip } from '@nestjs/common'
import { PurchasesService } from './purchases.service'
import { AdminGuard } from '../admin/admin.guard'

// TODO: Add AuthGuard when we have user authentication set up properly on frontend
// For now, we might need to pass userId in query or header if not using standard auth
// But ideally, we should use the authenticated user from the request.

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get('check-access')
  async checkAccess(
    @Query('examId') examId: number, 
    @Query('userId') userId: string,
    @Query('deviceFingerprint') deviceFingerprint?: string
  ) {
    // In a real app, userId should come from the JWT token in the request
    // const userId = req.user.id
    
    if (!userId) {
      return { hasAccess: false }
    }

    try {
      const hasAccess = await this.purchasesService.checkAccess(userId, Number(examId), deviceFingerprint)
      return { hasAccess }
    } catch (error: any) {
      if (error.status === 403) {
        return { 
          hasAccess: false, 
          error: error.message,
          isLocked: true 
        }
      }
      throw error
    }
  }

  @Get('my-purchases')
  async getMyPurchases(@Query('userId') userId: string) {
    if (!userId) return []
    return this.purchasesService.getUserPurchases(userId)
  }

  // Admin only endpoint - Fetch all locked accounts with pagination and filters
  @UseGuards(AdminGuard)
  @Get('locked')
  async getLockedAccounts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('examId') examId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      examId: examId ? Number(examId) : undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      search: search || undefined,
    }

    return this.purchasesService.getLockedAccounts(
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20,
      filters
    )
  }

  // Admin only endpoint - Get access history for a purchase
  @UseGuards(AdminGuard)
  @Get('history/:purchaseId')
  async getAccessHistory(@Param('purchaseId') purchaseId: string) {
    return this.purchasesService.getAccessHistory(Number(purchaseId))
  }

  // Admin only endpoint - Unlock a locked account
  @UseGuards(AdminGuard)
  @Get('unlock/:purchaseId')
  async unlockPurchase(
    @Param('purchaseId') purchaseId: string,
    @Req() req: any,
    @Ip() ip: string
  ) {
    const adminEmail = req.adminUser?.email
    await this.purchasesService.unlockPurchase(Number(purchaseId), adminEmail, ip)
    return { success: true, message: 'Account unlocked successfully' }
  }
}
