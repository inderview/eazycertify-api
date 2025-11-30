import { IsEnum, IsInt, IsOptional, IsString, MinLength, IsUrl } from 'class-validator'
import type { ProviderStatus } from '../provider.entity'

export class UpdateProviderDto {
	@IsOptional()
	@IsString()
	@MinLength(2)
	name?: string

	@IsOptional()
	@IsUrl({ require_protocol: true }, { message: 'logoUrl must be a valid URL' })
	logoUrl?: string

	@IsOptional()
	@IsEnum(['active', 'inactive'] as unknown as ProviderStatus[])
	status?: ProviderStatus

	@IsOptional()
	@IsInt()
	sortOrder?: number
}


