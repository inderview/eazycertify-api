import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core'

export type ProviderStatus = 'active' | 'inactive'

@Entity({ tableName: 'provider' })
export class Provider {
	@PrimaryKey()
	id!: number

	@Property()
	@Unique()
	name!: string

	@Property({ nullable: true })
	logoUrl?: string

	@Property()
	status!: ProviderStatus

	@Property({ type: 'timestamptz', onCreate: () => new Date() })
	createdAt: Date = new Date()

	@Property({ type: 'timestamptz', onUpdate: () => new Date(), nullable: true })
	updatedAt?: Date
}


