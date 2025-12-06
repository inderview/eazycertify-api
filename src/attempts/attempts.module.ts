import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { AttemptsController } from './attempts.controller'
import { AttemptsService } from './attempts.service'
import { ExamAttempt } from './attempt.entity'
import { AttemptAnswer } from './attempt-answer.entity'
import { Exam } from '../exams/exam.entity'
import { Question } from '../questions/question.entity'

@Module({
	imports: [
		MikroOrmModule.forFeature([ExamAttempt, AttemptAnswer, Exam, Question]),
	],
	controllers: [AttemptsController],
	providers: [AttemptsService],
	exports: [AttemptsService],
})
export class AttemptsModule {}
