import { Controller, Get } from '@nestjs/common'
import { ProvidersService } from './providers.service'

@Controller('providers')
export class PublicProvidersController {
	constructor (private readonly providers: ProvidersService) {}

	@Get()
	findAll () {
		return this.providers.findActive()
	}
}
