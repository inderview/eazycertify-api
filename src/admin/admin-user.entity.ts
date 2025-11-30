import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core'
import type { AdminRole } from './admin.types'
// import { EncryptedType } from '../common/encrypted.type'

@Entity({ tableName: 'admin_user' })
export class AdminUser {
	@PrimaryKey()
	id!: number

	@Property() // Temporarily disabled encryption: { type: EncryptedType }
	@Unique()
	email!: string

	@Property()
	password!: string

	@Property()
	role!: AdminRole

	@Property({ type: 'timestamptz', onCreate: () => new Date() })
	createdAt!: Date
}


