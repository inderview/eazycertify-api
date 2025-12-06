import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'testimonial' })
export class Testimonial {
	@PrimaryKey()
	id!: number

	@Property()
	name!: string

	@Property({ nullable: true })
	role?: string

	@Property({ type: 'text' })
	content!: string

	@Property()
	rating!: number

	@Property({ default: false })
	isApproved: boolean = false

	@Property({ type: 'timestamptz', onCreate: () => new Date() })
	createdAt: Date = new Date()
}
