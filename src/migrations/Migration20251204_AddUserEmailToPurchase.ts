import { Migration } from '@mikro-orm/migrations';

export class Migration20251204_AddUserEmailToPurchase extends Migration {

  async up(): Promise<void> {
    this.addSql(`
      alter table "purchase" 
      add column if not exists "user_email" varchar(255) null;
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      alter table "purchase" 
      drop column if exists "user_email";
    `);
  }

}
