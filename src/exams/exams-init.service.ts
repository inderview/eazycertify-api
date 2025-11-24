import { Injectable, OnModuleInit } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/postgresql'

@Injectable()
export class ExamsInitService implements OnModuleInit {
	constructor (private readonly em: EntityManager) {}

	async onModuleInit (): Promise<void> {
		await this.em.execute(`
			create table if not exists exam (
				id serial primary key,
				provider_id int not null references provider(id) on delete cascade,
				code text not null,
				title text not null,
				version text not null,
				status text not null,
				time_limit_minutes int not null,
				passing_score_percent int not null,
				total_questions_in_bank int not null,
				questions_per_mock_test int not null,
				price numeric,
				created_at timestamptz not null default now(),
				updated_at timestamptz
			);

			create index if not exists idx_exam_provider on exam (provider_id);
			create index if not exists idx_exam_code on exam (code);
		`)
	}
}


