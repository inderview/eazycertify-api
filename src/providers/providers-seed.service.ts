import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/postgresql'
import { Provider } from './provider.entity'

@Injectable()
export class ProvidersSeederService implements OnModuleInit {
	private readonly logger = new Logger(ProvidersSeederService.name)

	constructor (private readonly em: EntityManager) {}

	async onModuleInit (): Promise<void> {
		await this.seedProviders()
	}

	private async seedProviders (): Promise<void> {
		// Fork the entity manager to create a new context
		const em = this.em.fork()
		
		const providers = [
			{ name: 'Microsoft Azure', logoUrl: null, status: 'active' as const, sortOrder: 1 },
			{ name: 'Amazon AWS', logoUrl: null, status: 'active' as const, sortOrder: 2 },
			{ name: 'Google Cloud', logoUrl: null, status: 'active' as const, sortOrder: 3 },
			{ name: 'Cisco', logoUrl: null, status: 'active' as const, sortOrder: 4 },
			{ name: 'CompTIA', logoUrl: null, status: 'active' as const, sortOrder: 5 },
		]

		for (const providerData of providers) {
			const existing = await em.findOne(Provider, { name: providerData.name })
			
			if (!existing) {
				const provider = em.create(Provider, {
					...providerData,
					createdAt: new Date(),
				})
				await em.persistAndFlush(provider)
				this.logger.log(`Seeded provider: ${providerData.name}`)
			} else {
				this.logger.debug(`Provider already exists: ${providerData.name}`)
			}
		}
	}
}
