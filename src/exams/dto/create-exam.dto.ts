import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from 'class-validator'
import type { ExamStatus } from '../exam.entity'

export class CreateExamDto {
	@IsInt()
	@Min(1)
	providerId!: number

	@IsString()
	@MinLength(2)
	code!: string

	@IsString()
	@MinLength(2)
	title!: string

	@IsString()
	@MinLength(1)
	version!: string

	@IsEnum(['draft', 'active', 'archived'] as unknown as ExamStatus[])
	status!: ExamStatus

	@IsInt()
	@Min(1)
	timeLimitMinutes!: number

	@IsInt()
	@Min(0)
	passingScorePercent!: number

	@IsInt()
	@Min(0)
	totalQuestionsInBank!: number

	@IsInt()
	@Min(1)
	questionsPerMockTest!: number

	@IsOptional()
	@IsNumber()
	@IsPositive()
	price?: number

	@IsOptional()
	purchasable?: boolean

	@IsOptional()
	@IsInt()
	sortOrder?: number

	@IsOptional()
	@IsString()
	imageUrl?: string
}


