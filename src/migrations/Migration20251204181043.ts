import { Migration } from '@mikro-orm/migrations';

export class Migration20251204181043 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "attempt_answer" ("id" serial primary key, "attempt_id" int not null, "question_id" int not null, "selected_answer" jsonb null, "is_marked_for_review" boolean not null default false, "time_spent_seconds" int null, "is_correct" boolean null default false, "answered_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz null);`);

    this.addSql(`create table "exam_attempt" ("id" serial primary key, "user_id" uuid not null, "exam_id" int not null, "status" varchar(255) not null, "question_ids" jsonb null, "score" int null, "total_questions" int null, "correct_answers" int null, "started_at" timestamptz null, "completed_at" timestamptz null, "expires_at" timestamptz null, "metadata" jsonb null, "created_at" timestamptz not null, "updated_at" timestamptz null);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "attempt_answer" cascade;`);

    this.addSql(`drop table if exists "exam_attempt" cascade;`);
  }

}
