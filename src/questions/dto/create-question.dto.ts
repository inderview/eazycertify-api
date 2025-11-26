import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator'
import type { QuestionDifficulty, QuestionStatus, QuestionType } from '../question.entity'
import type { GroupMode } from '../question-group.entity'
import { Type } from 'class-transformer'

class QuestionOptionDto {
	@IsString()
	@MinLength(1)
	text!: string

	@IsBoolean()
	isCorrect!: boolean

	@IsOptional()
	@IsInt()
	optionOrder?: number
}

class QuestionGroupDto {
	@IsString()
	@MinLength(1)
	label!: string

	@IsEnum(['single', 'multi'] as unknown as GroupMode[])
	mode!: GroupMode

	@IsOptional()
	@IsInt()
	groupOrder?: number

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => QuestionOptionDto)
	options!: QuestionOptionDto[]
}

export class CreateQuestionDto {
	@IsInt()
	@Min(1)
	examId!: number

	@IsEnum(['single', 'multi', 'ordering', 'yesno', 'hotspot', 'dragdrop'] as unknown as QuestionType[])
	type!: QuestionType

	@IsString()
	@MinLength(1)
	text!: string

	@IsOptional()
	@IsString()
	attachments?: string

	@IsOptional()
	@IsString()
	topic?: string

	@IsEnum(['easy', 'medium', 'hard'] as unknown as QuestionDifficulty[])
	difficulty!: QuestionDifficulty

	@IsEnum(['draft', 'published'] as unknown as QuestionStatus[])
	status!: QuestionStatus

	@IsOptional()
	@IsBoolean()
	flagged?: boolean

	@IsOptional()
	@IsInt()
	orderIndex?: number

	@IsOptional()
	@IsInt()
	blockId?: number

	@IsOptional()
	@IsString()
	explanation?: string

	@IsOptional()
	@IsString()
	referenceUrl?: string

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => QuestionOptionDto)
	options!: QuestionOptionDto[]

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => QuestionGroupDto)
	groups?: QuestionGroupDto[]
}


