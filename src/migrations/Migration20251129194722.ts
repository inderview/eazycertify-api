import { Migration } from '@mikro-orm/migrations';

export class Migration20251129194722 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "exam" add column "image_url" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "exam" drop column "image_url";`);
  }

}
