import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'attempt_answer' })
export class AttemptAnswer {
	@PrimaryKey()
	id!: number

	@Property()
	attemptId!: number // FK -> exam_attempt.id

	@Property()
	questionId!: number // FK -> question.id

	@Property({ type: 'json', nullable: true })
	selectedAnswer?: any // Stores the user's answer (could be array, object, or string based on question type)

	@Property({ default: false })
	isMarkedForReview!: boolean

	@Property({ nullable: true })
	timeSpentSeconds?: number

	@Property({ default: false })
	isCorrect?: boolean

	@Property({ type: 'timestamptz', nullable: true })
	answeredAt?: Date

	@Property({ type: 'timestamptz', onCreate: () => new Date() })
	createdAt: Date = new Date()

	@Property({ type: 'timestamptz', onUpdate: () => new Date(), nullable: true })
	updatedAt?: Date
}
