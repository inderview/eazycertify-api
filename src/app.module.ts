import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { HealthModule } from './health/health.module'
import { AuthModule } from './auth/auth.module'
import { AdminModule } from './admin/admin.module'
import { ProvidersModule } from './providers/providers.module'
import { ExamsModule } from './exams/exams.module'
import { QuestionsModule } from './questions/questions.module'

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
		ExamsModule,
		QuestionsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
