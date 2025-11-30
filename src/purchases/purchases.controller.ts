import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common'
import { PurchasesService } from './purchases.service'

// TODO: Add AuthGuard when we have user authentication set up properly on frontend
// For now, we might need to pass userId in query or header if not using standard auth
// But ideally, we should use the authenticated user from the request.

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get('check-access')
  async checkAccess(@Query('examId') examId: number, @Query('userId') userId: string) {
    // In a real app, userId should come from the JWT token in the request
    // const userId = req.user.id
    
    if (!userId) {
      return { hasAccess: false }
    }

    const hasAccess = await this.purchasesService.checkAccess(userId, Number(examId))
    return { hasAccess }
  }

  @Get('my-purchases')
  async getMyPurchases(@Query('userId') userId: string) {
    if (!userId) return []
    return this.purchasesService.getUserPurchases(userId)
  }
}
