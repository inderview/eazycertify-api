import { Migration } from '@mikro-orm/migrations';

export class Migration20251206202152 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "testimonial" ("id" serial primary key, "name" varchar(255) not null, "role" varchar(255) null, "content" text not null, "rating" int not null, "is_approved" boolean not null default false, "created_at" timestamptz not null);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "testimonial" cascade;`);
  }

}
