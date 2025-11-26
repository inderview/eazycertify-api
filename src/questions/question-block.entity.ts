import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'question_block' })
export class QuestionBlock {
	@PrimaryKey()
	id!: number

	@Property()
	title!: string

	@Property()
	scenario!: string // rich text

	@Property({ nullable: true })
	images?: string // comma-separated URLs

	@Property({ type: 'timestamptz', onCreate: () => new Date() })
	createdAt: Date = new Date()

	@Property({ type: 'timestamptz', onUpdate: () => new Date(), nullable: true })
	updatedAt?: Date
}


