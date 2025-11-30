import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator'
import type { QuestionDifficulty, QuestionStatus, QuestionType } from '../question.entity'
import type { GroupMode } from '../question-group.entity'
import { Type } from 'class-transformer'

class QuestionOptionUpdateDto {
	@IsOptional()
	@IsInt()
	id?: number

	@IsString()
	@MinLength(1)
	text!: string

	@IsBoolean()
	isCorrect!: boolean

	@IsOptional()
	@IsInt()
	optionOrder?: number
}

class QuestionGroupUpdateDto {
	@IsString()
	label!: string

	@IsEnum(['single', 'multi'] as unknown as GroupMode[])
	mode!: GroupMode

	@IsOptional()
	@IsInt()
	groupOrder?: number

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => QuestionOptionUpdateDto)
	options!: QuestionOptionUpdateDto[]
}

export class UpdateQuestionDto {
	@IsOptional()
	@IsInt()
	@Min(1)
	examId?: number

	@IsOptional()
	@IsEnum(['single', 'multi', 'ordering', 'yesno', 'hotspot', 'dragdrop'] as unknown as QuestionType[])
	type?: QuestionType

	@IsOptional()
	@IsString()
	@MinLength(1)
	text?: string

	@IsOptional()
	@IsString()
	attachments?: string

	@IsOptional()
	@IsString()
	topic?: string

	@IsOptional()
	@IsEnum(['easy', 'medium', 'hard'] as unknown as QuestionDifficulty[])
	difficulty?: QuestionDifficulty

	@IsOptional()
	@IsEnum(['draft', 'published'] as unknown as QuestionStatus[])
	status?: QuestionStatus

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

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => QuestionOptionUpdateDto)
	options?: QuestionOptionUpdateDto[]

	// For HOTSPOT updates, allow full replace of groups
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => QuestionGroupUpdateDto)
	groups?: QuestionGroupUpdateDto[]

	@IsOptional()
	@IsInt()
	sortOrder?: number
}


