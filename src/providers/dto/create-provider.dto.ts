import { IsEnum, IsInt, IsOptional, IsString, MinLength, IsUrl } from 'class-validator'
import type { ProviderStatus } from '../provider.entity'

export class CreateProviderDto {
	@IsString()
	@MinLength(2)
	name!: string

	@IsOptional()
	@IsUrl({ require_protocol: true }, { message: 'logoUrl must be a valid URL' })
	logoUrl?: string

	@IsEnum(['active', 'inactive'] as unknown as ProviderStatus[])
	status!: ProviderStatus

	@IsOptional()
	@IsInt()
	sortOrder?: number
}
