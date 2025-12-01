import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core'
import { Purchase } from './purchase.entity'

@Entity()
export class PurchaseAuditLog {
  @PrimaryKey()
  id!: number

  @ManyToOne(() => Purchase)
  purchase!: Purchase

  @Property()
  action!: string // 'locked', 'unlocked', 'access_granted', 'access_denied'

  @Property()
  adminEmail?: string // Email of admin who performed the action

  @Property({ type: 'text', nullable: true })
  reason?: string

  @Property({ type: 'text', nullable: true })
  metadata?: string // JSON string for additional data

  @Property()
  ipAddress?: string

  @Property()
  createdAt: Date = new Date()
}
