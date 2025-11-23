import { Body, Controller, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common'
import { AdminService } from './admin.service'
import { AdminLoginDto } from './dto/login.dto'
import { Get, Headers } from '@nestjs/common'

@Controller('admin')
export class AdminController {
	constructor (private readonly adminService: AdminService) {}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login (@Body() body: AdminLoginDto, @Ip() ip: string): Promise<{ token: string, role: string }> {
		return await this.adminService.validateLogin(body.email, body.password, ip || 'unknown')
	}

	@Get('me')
	me (@Headers('authorization') authHeader?: string): { email: string, role: string } {
		if (!authHeader?.startsWith('Bearer ')) {
			throw new Error('Unauthorized')
		}
		const token = authHeader.slice('Bearer '.length)
		return this.adminService.verifyToken(token)
	}

	@Get('stats')
	stats (@Headers('authorization') authHeader?: string) {
		if (!authHeader?.startsWith('Bearer ')) {
			throw new Error('Unauthorized')
		}
		const token = authHeader.slice('Bearer '.length)
		this.adminService.verifyToken(token)
		return this.adminService.getDummyStats()
	}
}


