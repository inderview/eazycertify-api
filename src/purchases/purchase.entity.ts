import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core'
import { Exam } from '../exams/exam.entity'

@Entity()
export class Purchase {
  @PrimaryKey()
  id!: number

  @Property()
  userId!: string

  @ManyToOne(() => Exam)
  exam!: Exam

  @Property()
  stripeSessionId!: string

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number

  @Property()
  currency!: string

  @Property()
  duration!: string

  @Property()
  withAI!: boolean

  @Property()
  expiresAt!: Date

  @Property()
  createdAt: Date = new Date()
}
