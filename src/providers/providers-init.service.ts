import { Injectable, OnModuleInit } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/postgresql'

@Injectable()
export class ProvidersInitService implements OnModuleInit {
	constructor (private readonly em: EntityManager) {}

	async onModuleInit (): Promise<void> {
		await this.em.execute(`
			create table if not exists provider (
				id serial primary key,
				name text not null unique,
				logo_url text,
				status text not null,
				created_at timestamptz not null default now(),
				updated_at timestamptz
			);

			create index if not exists idx_provider_name on provider (name);
		`)
	}
}


