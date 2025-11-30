import { Migration } from '@mikro-orm/migrations';

export class Migration20251129_AddPurchasableToExam extends Migration {

  async up(): Promise<void> {
    await this.execute(`ALTER TABLE "exam" ADD COLUMN "purchasable" BOOLEAN NOT NULL DEFAULT false;`);
  }

  async down(): Promise<void> {
    await this.execute(`ALTER TABLE "exam" DROP COLUMN "purchasable";`);
  }

}
