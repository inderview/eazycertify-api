import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned'

@Entity({ tableName: 'exam_attempt' })
export class ExamAttempt {
	@PrimaryKey()
	id!: number

	@Property({ type: 'uuid' })
	userId!: string // FK -> users.id

	@Property()
	examId!: number // FK -> exam.id

	@Property()
	status!: AttemptStatus

	@Property({ type: 'json', nullable: true })
	questionIds?: number[] // Array of question IDs in the order they were presented

	@Property({ nullable: true })
	score?: number

	@Property({ nullable: true })
	totalQuestions?: number

	@Property({ nullable: true })
	correctAnswers?: number

	@Property({ type: 'timestamptz', nullable: true })
	startedAt?: Date

	@Property({ type: 'timestamptz', nullable: true })
	completedAt?: Date

	@Property({ type: 'timestamptz', nullable: true })
	expiresAt?: Date

	@Property({ type: 'json', nullable: true })
	metadata?: {
		deviceFingerprint?: string
		ipAddress?: string
		userAgent?: string
	}

	@Property({ type: 'timestamptz', onCreate: () => new Date() })
	createdAt: Date = new Date()

	@Property({ type: 'timestamptz', onUpdate: () => new Date(), nullable: true })
	updatedAt?: Date
}
