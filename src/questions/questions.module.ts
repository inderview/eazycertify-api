import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Question } from './question.entity'
import { QuestionOption } from './question-option.entity'
import { QuestionBlock } from './question-block.entity'
import { QuestionsService } from './questions.service'
import { QuestionsController } from './questions.controller'
import { QuestionsInitService } from './questions-init.service'
import { AdminService } from '../admin/admin.service'

@Module({
	imports: [MikroOrmModule.forFeature([Question, QuestionOption, QuestionBlock])],
	providers: [QuestionsService, QuestionsInitService, AdminService],
	controllers: [QuestionsController],
})
export class QuestionsModule {}


