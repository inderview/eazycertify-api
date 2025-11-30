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
}
