import { IsInt, IsOptional, IsBoolean, IsNumber } from 'class-validator'

export class SaveAnswerDto {
	@IsInt()
	attemptId!: number

	@IsInt()
	questionId!: number

	@IsOptional()
	selectedAnswer?: any

	@IsOptional()
	@IsBoolean()
	isMarkedForReview?: boolean

	@IsOptional()
	@IsNumber()
	timeSpentSeconds?: number
}
