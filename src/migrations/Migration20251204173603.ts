import { Migration } from '@mikro-orm/migrations';

export class Migration20251204173603 extends Migration {

  override async up(): Promise<void> {
    // Tables already exist, skipping creation to avoid 42P07
    // this.addSql(`create table "contact_messages" ...`);
    // this.addSql(`create table "purchase_audit_log" ...`);
    // this.addSql(`create table "purchase_device" ...`);
    // this.addSql(`alter table "purchase_device" add constraint "purchase_device_purchase_id_unique" unique ("purchase_id");`);
    // this.addSql(`create table "users" ...`);
    // this.addSql(`alter table "purchase_audit_log" ...`);
    // this.addSql(`alter table "purchase_device" ...`);

    this.addSql(`alter table "exam" add column "configuration" jsonb null;`);

    // this.addSql(`alter table "purchase" add column "user_email" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    // this.addSql(`drop table if exists "contact_messages" cascade;`);
    // this.addSql(`drop table if exists "purchase_audit_log" cascade;`);
    // this.addSql(`drop table if exists "purchase_device" cascade;`);
    // this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`alter table "exam" drop column "configuration";`);

    // this.addSql(`alter table "purchase" drop column "user_email";`);
  }

}
