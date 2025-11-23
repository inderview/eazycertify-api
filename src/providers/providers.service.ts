import { Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/postgresql'
import { Provider } from './provider.entity'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'

@Injectable()
export class ProvidersService {
	constructor (private readonly em: EntityManager) {}

	findAll (): Promise<Provider[]> {
		return this.em.find(Provider, {}, { orderBy: { name: 'asc' } })
	}

	async create (dto: CreateProviderDto): Promise<Provider> {
		const provider = this.em.create(Provider, {
			name: dto.name.trim(),
			logoUrl: dto.logoUrl,
			status: dto.status,
			createdAt: new Date(),
		})
		await this.em.persistAndFlush(provider)
		return provider
	}

	async update (id: number, dto: UpdateProviderDto): Promise<Provider> {
		const provider = await this.em.findOne(Provider, { id })
		if (!provider) throw new NotFoundException('Provider not found')
		if (dto.name !== undefined) provider.name = dto.name.trim()
		if (dto.logoUrl !== undefined) provider.logoUrl = dto.logoUrl
		if (dto.status !== undefined) provider.status = dto.status
		await this.em.flush()
		return provider
	}

	async remove (id: number): Promise<void> {
		const provider = await this.em.findOne(Provider, { id })
		if (!provider) throw new NotFoundException('Provider not found')
		await this.em.removeAndFlush(provider)
	}
}


