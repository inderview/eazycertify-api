import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Provider } from './provider.entity'
import { ProvidersService } from './providers.service'
import { ProvidersController } from './providers.controller'
import { PublicProvidersController } from './public-providers.controller'
import { ProvidersInitService } from './providers-init.service'
import { ProvidersSeederService } from './providers-seed.service'
import { AdminService } from '../admin/admin.service'

@Module({
	imports: [MikroOrmModule.forFeature([Provider])],
	providers: [ProvidersService, ProvidersInitService, ProvidersSeederService, AdminService],
	controllers: [ProvidersController, PublicProvidersController],
})
export class ProvidersModule {}


