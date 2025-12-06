import { Migration } from '@mikro-orm/migrations';

export class Migration20251204_AddReplyToContactMessages extends Migration {

  async up(): Promise<void> {
    this.addSql(`
      alter table "contact_messages" 
      add column if not exists "reply" text null,
      add column if not exists "replied_at" timestamptz null;
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      alter table "contact_messages" 
      drop column if exists "reply",
      drop column if exists "replied_at";
    `);
  }

}
