import { Entity, PrimaryKey, Property, OneToOne } from '@mikro-orm/core';
import { Purchase } from './purchase.entity';

@Entity()
export class PurchaseDevice {
  @PrimaryKey()
  id!: number;

  @OneToOne(() => Purchase, { owner: true })
  purchase!: Purchase;

  @Property()
  deviceFingerprint!: string;

  @Property()
  isLocked: boolean = false;

  @Property({ nullable: true })
  lockReason?: string;

  @Property({ nullable: true })
  lastAccessedAt?: Date;

  @Property()
  createdAt: Date = new Date();
}
