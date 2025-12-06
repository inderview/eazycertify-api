import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'uuid' })
  id!: string; // Matches Supabase Auth User ID

  @Property()
  email!: string;

  @Property({ nullable: true })
  fullName?: string;

  @Property({ nullable: true })
  avatarUrl?: string;

  @Property({ default: 'email' })
  provider: string = 'email';

  @Property({ type: 'timestamptz', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
