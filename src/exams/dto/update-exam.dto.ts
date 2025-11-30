import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from 'class-validator'
import type { ExamStatus } from '../exam.entity'

export class UpdateExamDto {
	@IsOptional()
	@IsInt()
	@Min(1)
	providerId?: number

	@IsOptional()
	@IsString()
	@MinLength(2)
	code?: string

	@IsOptional()
	@IsString()
	@MinLength(2)
	title?: string

	@IsOptional()
	@IsString()
	@MinLength(1)
	version?: string

	@IsOptional()
	@IsEnum(['draft', 'active', 'archived'] as unknown as ExamStatus[])
	status?: ExamStatus

	@IsOptional()
	@IsInt()
	@Min(1)
	timeLimitMinutes?: number

	@IsOptional()
	@IsInt()
	@Min(0)
	passingScorePercent?: number

	@IsOptional()
	@IsInt()
	@Min(0)
	totalQuestionsInBank?: number

	@IsOptional()
	@IsInt()
	@Min(1)
	questionsPerMockTest?: number

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


