import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { AdminUser } from './admin-user.entity'
import { AdminInitService } from './admin-init.service'

@Module({
	imports: [MikroOrmModule.forFeature([AdminUser])],
	controllers: [AdminController],
	providers: [AdminService, AdminInitService],
})
export class AdminModule {}


