import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

export type ContactReason = 'bug' | 'suggestion' | 'feature_request' | 'support' | 'billing' | 'partnership' | 'other'
export type ContactStatus = 'new' | 'in_progress' | 'resolved' | 'closed'

@Entity({ tableName: 'contact_messages' })
export class ContactMessage {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property({ nullable: true, type: 'uuid' })
  userId?: string

  @Property()
  name!: string

  @Property()
  email!: string

  @Property()
  subject!: string

  @Property()
  reason!: ContactReason

  @Property({ nullable: true })
  reasonOther?: string

  @Property({ type: 'text' })
  message!: string

  @Property({ default: 'new' })
  status: ContactStatus = 'new'

  @Property({ type: 'text', nullable: true })
  reply?: string

  @Property({ type: 'timestamptz', nullable: true })
  repliedAt?: Date

  @Property({ type: 'jsonb', nullable: true })
  metadata?: any

  @Property({ type: 'timestamptz', onCreate: () => new Date() })
  createdAt: Date = new Date()

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
