import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

export type ExamStatus = 'draft' | 'active' | 'archived'

@Entity({ tableName: 'exam' })
export class Exam {
	@PrimaryKey()
	id!: number

	@Property()
	providerId!: number // FK -> provider.id

	@Property()
	code!: string

	@Property()
	title!: string

	@Property()
	version!: string

	@Property()
	status!: ExamStatus

	@Property()
	timeLimitMinutes!: number

	@Property()
	passingScorePercent!: number

	@Property()
	totalQuestionsInBank!: number

	@Property()
	questionsPerMockTest!: number

	@Property({ nullable: true })
	price?: number

	@Property({ default: false })
	purchasable: boolean = false

	@Property({ nullable: true })
	sortOrder?: number

	@Property({ nullable: true })
	imageUrl?: string

	@Property({ type: 'json', nullable: true })
	configuration?: {
		topicDistribution?: Record<string, number>
		typeDistribution?: Record<string, number>
		overlapPolicy?: {
			minNewPercent?: number
			maxRepeatFromLast?: number
		}
	}

	@Property({ type: 'timestamptz', onCreate: () => new Date() })
	createdAt: Date = new Date()

	@Property({ type: 'timestamptz', onUpdate: () => new Date(), nullable: true })
	updatedAt?: Date
}


