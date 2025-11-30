import { Injectable } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/core'
import { Purchase } from './purchase.entity'

@Injectable()
export class PurchasesService {
  constructor(private readonly em: EntityManager) {}

  async checkAccess(userId: string, examId: number): Promise<boolean> {
    const now = new Date()
    const purchase = await this.em.findOne(Purchase, {
      userId,
      exam: { id: examId },
      expiresAt: { $gt: now }
    })
    
    return !!purchase
  }

  async getUserPurchases(userId: string) {
    const now = new Date()
    const purchases = await this.em.find(Purchase, {
      userId,
      expiresAt: { $gt: now }
    }, { populate: ['exam'] })
    
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
}
