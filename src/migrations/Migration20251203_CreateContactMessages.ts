import { Migration } from '@mikro-orm/migrations';

export class Migration20251203_CreateContactMessages extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "contact_messages" (
      "id" uuid not null default gen_random_uuid(),
      "user_id" uuid null,
      "name" varchar(255) not null,
      "email" varchar(255) not null,
      "subject" varchar(255) not null,
      "reason" varchar(255) not null,
      "reason_other" varchar(255) null,
      "message" text not null,
      "status" varchar(255) not null default 'new',
      "metadata" jsonb null,
      "created_at" timestamptz not null,
      "updated_at" timestamptz not null,
      constraint "contact_messages_pkey" primary key ("id")
    );`);

    // Add check constraints to match the entity/DTO validation if possible, or leave it to app layer.
    // The original SQL had check constraints, I'll add them for robustness.
    this.addSql(`alter table "contact_messages" add constraint "contact_messages_reason_check" check ("reason" in ('bug', 'suggestion', 'feature_request', 'support', 'billing', 'partnership', 'other'));`);
    this.addSql(`alter table "contact_messages" add constraint "contact_messages_status_check" check ("status" in ('new', 'in_progress', 'resolved', 'closed'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "contact_messages" cascade;`);
  }

}
