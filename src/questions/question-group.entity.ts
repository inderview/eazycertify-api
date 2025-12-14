import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

export type GroupMode = 'single' | 'multi'
export type SlotType = 'text' | 'select'

@Entity({ tableName: 'question_group' })
export class QuestionGroup {
	@PrimaryKey()
	id!: number

	@Property()
	questionId!: number // FK -> question.id

	@Property()
	label!: string

	@Property()
	mode!: GroupMode

	@Property({ nullable: true })
	groupOrder?: number

	@Property({ nullable: true })
	slotType?: SlotType
}


