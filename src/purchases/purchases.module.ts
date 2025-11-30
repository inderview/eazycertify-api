import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Purchase } from './purchase.entity'
import { PurchasesService } from './purchases.service'
import { PurchasesController } from './purchases.controller'

@Module({
  imports: [MikroOrmModule.forFeature([Purchase])],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
