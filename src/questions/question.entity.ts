import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

export type QuestionType = 'single' | 'multi' | 'ordering' | 'yesno' | 'hotspot' | 'dragdrop'
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'
export type QuestionStatus = 'draft' | 'published'

@Entity({ tableName: 'question' })
export class Question {
	@PrimaryKey()
	id!: number

	@Property()
	examId!: number // FK -> exam.id

	@Property()
	type!: QuestionType

	@Property()
	text!: string // rich-text (stored as HTML/markdown)

	@Property({ nullable: true })
	attachments?: string // comma-separated URLs for simplicity

	@Property({ nullable: true })
	topic?: string

	@Property()
	difficulty!: QuestionDifficulty

	@Property()
	status!: QuestionStatus

	@Property({ default: false })
	flagged!: boolean

	@Property({ nullable: true })
	orderIndex?: number

	@Property({ nullable: true })
	sortOrder?: number

	@Property({ nullable: true })
	blockId?: number // FK -> question_block.id

	@Property({ nullable: true })
	explanation?: string

	@Property({ nullable: true })
	referenceUrl?: string

	@Property({ type: 'timestamptz', onCreate: () => new Date() })
	createdAt: Date = new Date()

	@Property({ type: 'timestamptz', onUpdate: () => new Date(), nullable: true })
	updatedAt?: Date
}


