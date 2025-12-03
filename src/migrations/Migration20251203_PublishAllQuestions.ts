import { Migration } from '@mikro-orm/migrations';

export class Migration20251203_PublishAllQuestions extends Migration {

  override async up(): Promise<void> {
    // Update all questions to published status
    this.addSql(`UPDATE question SET status = 'published' WHERE status = 'draft' OR status IS NULL;`);
  }

  override async down(): Promise<void> {
    // Optionally revert back to draft
    this.addSql(`UPDATE question SET status = 'draft' WHERE status = 'published';`);
  }

}
