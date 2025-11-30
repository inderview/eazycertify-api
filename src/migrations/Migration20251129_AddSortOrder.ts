import { Migration } from '@mikro-orm/migrations'

export class Migration20251129_AddSortOrder extends Migration {
	async up(): Promise<void> {
		// Add sortOrder column to provider table
		await this.execute(`
			ALTER TABLE "provider" 
			ADD COLUMN IF NOT EXISTS "sort_order" integer;
		`)

		// Add sortOrder column to exam table
		await this.execute(`
			ALTER TABLE "exam" 
			ADD COLUMN IF NOT EXISTS "sort_order" integer;
		`)

		// Add sortOrder column to question table
		await this.execute(`
			ALTER TABLE "question" 
			ADD COLUMN IF NOT EXISTS "sort_order" integer;
		`)
	}

	async down(): Promise<void> {
		// Remove sortOrder column from provider table
		await this.execute(`
			ALTER TABLE "provider" 
			DROP COLUMN IF EXISTS "sort_order";
		`)

		// Remove sortOrder column from exam table
		await this.execute(`
			ALTER TABLE "exam" 
			DROP COLUMN IF EXISTS "sort_order";
		`)

		// Remove sortOrder column from question table
		await this.execute(`
			ALTER TABLE "question" 
			DROP COLUMN IF EXISTS "sort_order";
		`)
	}
}
