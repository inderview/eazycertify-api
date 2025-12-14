import { Migration } from '@mikro-orm/migrations'

export class Migration20251210_AddSlotTypeToQuestionGroup extends Migration {

	override async up (): Promise<void> {
		this.addSql('alter table "question_group" add column "slot_type" varchar(16) null;')
	}

	override async down (): Promise<void> {
		this.addSql('alter table "question_group" drop column "slot_type";')
	}
}

