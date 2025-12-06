import { Migration } from '@mikro-orm/migrations';

export class Migration20251204_CreatePurchaseDeviceTable extends Migration {

  async up(): Promise<void> {
    this.addSql(`
      create table if not exists "purchase_device" (
        "id" serial primary key,
        "purchase_id" int not null,
        "device_fingerprint" varchar(255) not null,
        "is_locked" boolean not null default false,
        "lock_reason" text null,
        "locked_at" timestamptz null,
        "last_accessed_at" timestamptz null,
        "created_at" timestamptz not null,
        constraint "purchase_device_purchase_id_unique" unique ("purchase_id")
      );
    `);

    this.addSql(`
      alter table "purchase_device" 
      add constraint "purchase_device_purchase_id_foreign" 
      foreign key ("purchase_id") references "purchase" ("id") 
      on update cascade on delete cascade;
    `);

    this.addSql(`
      create table if not exists "purchase_audit_log" (
        "id" serial primary key,
        "purchase_id" int not null,
        "action" varchar(255) not null,
        "admin_email" varchar(255) null,
        "reason" text null,
        "ip_address" varchar(255) null,
        "metadata" text null,
        "created_at" timestamptz not null
      );
    `);

    this.addSql(`
      alter table "purchase_audit_log" 
      add constraint "purchase_audit_log_purchase_id_foreign" 
      foreign key ("purchase_id") references "purchase" ("id") 
      on update cascade on delete cascade;
    `);
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "purchase_device" cascade;`);
    this.addSql(`drop table if exists "purchase_audit_log" cascade;`);
  }

}
