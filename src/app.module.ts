import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { HealthModule } from './health/health.module'
import { AuthModule } from './auth/auth.module'
import { AdminModule } from './admin/admin.module'
import { ProvidersModule } from './providers/providers.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		MikroOrmModule.forRoot(),
		HealthModule,
		AuthModule,
		AdminModule,
		ProvidersModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
