import { IsEmail, IsIn, IsOptional, IsString, Length, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export const CONTACT_REASONS = ['bug','suggestion','feature_request','support','billing','partnership','other'] as const;
export type ContactReason = typeof CONTACT_REASONS[number];

export class CreateContactDto {
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @Length(2, 200)
  name!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  email!: string;

  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @Length(3, 200)
  subject!: string;

  @IsIn(CONTACT_REASONS as unknown as string[])
  reason!: ContactReason;

  @ValidateIf(o => o.reason === 'other')
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @Length(3, 200)
  @IsOptional()
  reasonOther?: string;

  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @Length(10, 5000)
  message!: string;

  // Optional metadata captured server-side
  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  pageUrl?: string;
}
