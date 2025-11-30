import { Migration } from '@mikro-orm/migrations';

export class Migration20251129173924 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "purchase" ("id" serial primary key, "user_id" varchar(255) not null, "exam_id" int not null, "stripe_session_id" varchar(255) not null, "amount" numeric(10,2) not null, "currency" varchar(255) not null, "duration" varchar(255) not null, "with_ai" boolean not null, "expires_at" timestamptz not null, "created_at" timestamptz not null);`);

    this.addSql(`alter table "purchase" add constraint "purchase_exam_id_foreign" foreign key ("exam_id") references "exam" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "purchase" cascade;`);
  }

}
