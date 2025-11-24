import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Exam } from './exam.entity'
import { ExamsService } from './exams.service'
import { ExamsController } from './exams.controller'
import { ExamsInitService } from './exams-init.service'
import { AdminService } from '../admin/admin.service'

@Module({
	imports: [MikroOrmModule.forFeature([Exam])],
	providers: [ExamsService, ExamsInitService, AdminService],
	controllers: [ExamsController],
})
export class ExamsModule {}


