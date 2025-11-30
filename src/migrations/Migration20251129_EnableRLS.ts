import { Migration } from '@mikro-orm/migrations';

export class Migration20251129_EnableRLS extends Migration {

  async up(): Promise<void> {
    const tables = [
      'admin_user',
      'exam',
      'provider',
      'question',
      'question_group',
      'question_option'
    ];

    for (const table of tables) {
      // 1. Enable RLS
      await this.execute(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);

      // 2. Drop existing policy if it exists, then create
      await this.execute(`DROP POLICY IF EXISTS "Enable all for service_role" ON "${table}";`);
      await this.execute(`
        CREATE POLICY "Enable all for service_role"
        ON "${table}"
        AS PERMISSIVE
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
      `);
    }

    // 3. Allow Read Access for Authenticated/Anon users for public content
    const publicTables = [
      'exam',
      'provider',
      'question',
      'question_group',
      'question_option'
    ];

    for (const table of publicTables) {
      await this.execute(`DROP POLICY IF EXISTS "Enable read access for all users" ON "${table}";`);
      await this.execute(`
        CREATE POLICY "Enable read access for all users"
        ON "${table}"
        AS PERMISSIVE
        FOR SELECT
        TO public
        USING (true);
      `);
    }
  }

  async down(): Promise<void> {
    const tables = [
      'admin_user',
      'exam',
      'provider',
      'question',
      'question_group',
      'question_option'
    ];

    for (const table of tables) {
      await this.execute(`DROP POLICY IF EXISTS "Enable read access for all users" ON "${table}";`);
      await this.execute(`DROP POLICY IF EXISTS "Enable all for service_role" ON "${table}";`);
      await this.execute(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`);
    }
  }

}
