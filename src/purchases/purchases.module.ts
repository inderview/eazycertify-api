import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Purchase } from './purchase.entity'
import { PurchaseDevice } from './purchase-device.entity'
import { PurchaseAuditLog } from './purchase-audit-log.entity'
import { PurchasesService } from './purchases.service'
import { PurchasesController } from './purchases.controller'
import { AdminModule } from '../admin/admin.module'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [
    MikroOrmModule.forFeature([Purchase, PurchaseDevice, PurchaseAuditLog]),
    AdminModule,
    EmailModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
