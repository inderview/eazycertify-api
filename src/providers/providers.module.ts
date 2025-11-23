import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Provider } from './provider.entity'
import { ProvidersService } from './providers.service'
import { ProvidersController } from './providers.controller'
import { ProvidersInitService } from './providers-init.service'
import { AdminService } from '../admin/admin.service'

@Module({
	imports: [MikroOrmModule.forFeature([Provider])],
	providers: [ProvidersService, ProvidersInitService, AdminService],
	controllers: [ProvidersController],
})
export class ProvidersModule {}


