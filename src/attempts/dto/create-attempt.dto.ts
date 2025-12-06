import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateAttemptDto {
	@IsInt()
	examId!: number

	@IsOptional()
	@IsUUID()
	userId?: string

	@IsOptional()
	@IsString()
	deviceFingerprint?: string

	@IsOptional()
	@IsString()
	ipAddress?: string

	@IsOptional()
	@IsString()
	userAgent?: string
}
