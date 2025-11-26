import { Injectable, OnModuleInit } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/postgresql'

@Injectable()
export class QuestionsInitService implements OnModuleInit {
	constructor (private readonly em: EntityManager) {}

	async onModuleInit (): Promise<void> {
		await this.em.execute(`
			create table if not exists question_block (
				id serial primary key,
				title text not null,
				scenario text not null,
				images text,
				created_at timestamptz not null default now(),
				updated_at timestamptz
			);

			create table if not exists question (
				id serial primary key,
				exam_id int not null references exam(id) on delete cascade,
				type text not null,
				text text not null,
				attachments text,
				topic text,
				difficulty text not null,
				status text not null,
				flagged boolean not null default false,
				order_index int,
				block_id int references question_block(id) on delete set null,
				explanation text,
				reference_url text,
				created_at timestamptz not null default now(),
				updated_at timestamptz
			);
			create index if not exists idx_question_exam on question (exam_id);
			create index if not exists idx_question_status on question (status);
			create index if not exists idx_question_topic on question (topic);

			create table if not exists question_option (
				id serial primary key,
				question_id int not null references question(id) on delete cascade,
				group_id int references question_group(id) on delete cascade,
				text text not null,
				is_correct boolean not null default false,
				option_order int
			);
			create index if not exists idx_qopt_question on question_option (question_id);

			create table if not exists question_group (
				id serial primary key,
				question_id int not null references question(id) on delete cascade,
				label text not null,
				mode text not null,
				group_order int
			);
			create index if not exists idx_qgroup_question on question_group (question_id);
		`)
	}
}


