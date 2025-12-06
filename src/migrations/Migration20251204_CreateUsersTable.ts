import { Migration } from '@mikro-orm/migrations';

export class Migration20251204_CreateUsersTable extends Migration {

  async up(): Promise<void> {
    this.addSql(`
      create table if not exists "users" (
        "id" uuid not null,
        "email" varchar(255) not null,
        "full_name" varchar(255) null,
        "avatar_url" varchar(255) null,
        "provider" varchar(255) not null default 'email',
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        constraint "users_pkey" primary key ("id")
      );
    `);

    this.addSql(`create index if not exists "users_email_index" on "users" ("email");`);
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "users" cascade;`);
  }

}
