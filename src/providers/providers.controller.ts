import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ProvidersService } from './providers.service'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { AdminService } from '../admin/admin.service'

@Controller('admin/providers')
export class ProvidersController {
	constructor (private readonly providers: ProvidersService, private readonly admin: AdminService) {}

	private assertAuth (authHeader?: string): void {
		if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized')
		const token = authHeader.slice('Bearer '.length)
		this.admin.verifyToken(token)
	}

	@Get()
	findAll (@Headers('authorization') auth?: string) {
		this.assertAuth(auth)
		return this.providers.findAll()
	}

	@Post()
	create (@Headers('authorization') auth: string | undefined, @Body() dto: CreateProviderDto) {
		this.assertAuth(auth)
		return this.providers.create(dto)
	}

	@Put(':id')
	update (
		@Headers('authorization') auth: string | undefined,
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateProviderDto,
	) {
		this.assertAuth(auth)
		return this.providers.update(id, dto)
	}

	@Delete(':id')
	remove (@Headers('authorization') auth: string | undefined, @Param('id', ParseIntPipe) id: number) {
		this.assertAuth(auth)
		return this.providers.remove(id)
	}
}


