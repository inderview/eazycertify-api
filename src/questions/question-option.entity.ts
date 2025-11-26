import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'question_option' })
export class QuestionOption {
	@PrimaryKey()
	id!: number

	@Property()
	questionId!: number // FK -> question.id

	@Property({ nullable: true })
	groupId?: number // FK -> question_group.id

	@Property()
	text!: string

	@Property({ default: false })
	isCorrect!: boolean

	@Property({ nullable: true })
	optionOrder?: number
}


