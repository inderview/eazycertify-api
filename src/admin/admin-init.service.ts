import { Injectable, OnModuleInit } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/postgresql'

@Injectable()
export class AdminInitService implements OnModuleInit {
	constructor (private readonly em: EntityManager) {}

	async onModuleInit (): Promise<void> {
		// Create admin_user table if not exists
		await this.em.execute(`
			create table if not exists admin_user (
				id serial primary key,
				email text not null unique,
				password text not null,
				role text not null,
				created_at timestamptz not null default now()
			);
		`)

		// Seed default users (plain-text passwords for dev)
		await this.em.execute(`
			insert into admin_user (email, password, role)
			values
				('admin@eazycertify.local','Admin@12345','super_admin'),
				('exam.admin@eazycertify.local','ExamAdmin@123','exam_admin'),
				('contrib@eazycertify.local','Contributor@123','content_contributor')
			on conflict (email) do nothing;
		`)
	}
}


