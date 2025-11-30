import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Exam } from './exam.entity'
import { Provider } from '../providers/provider.entity'
import { ExamsService } from './exams.service'
import { ExamsController } from './exams.controller'
import { PublicExamsController } from './public-exams.controller'
import { ExamsInitService } from './exams-init.service'
import { ExamsSeederService } from './exams-seed.service'
import { AdminService } from '../admin/admin.service'

@Module({
	imports: [MikroOrmModule.forFeature([Exam, Provider])],
	providers: [ExamsService, ExamsInitService, ExamsSeederService, AdminService],
	controllers: [ExamsController, PublicExamsController],
})
export class ExamsModule {}


