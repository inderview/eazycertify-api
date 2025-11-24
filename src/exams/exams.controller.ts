import { Controller, Get, Headers, Query, Post, Body, Put, Param, ParseIntPipe, Delete } from '@nestjs/common'
import { ExamsService } from './exams.service'
import { AdminService } from '../admin/admin.service'
import { CreateExamDto } from './dto/create-exam.dto'
import { UpdateExamDto } from './dto/update-exam.dto'

@Controller('admin/exams')
export class ExamsController {
	constructor (private readonly exams: ExamsService, private readonly admin: AdminService) {}

	private assertAuth (authHeader?: string): void {
		if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized')
		const token = authHeader.slice('Bearer '.length)
		this.admin.verifyToken(token)
	}

	@Get()
	findAll (@Headers('authorization') auth?: string, @Query('providerId') providerId?: string) {
		this.assertAuth(auth)
		const pid = providerId ? Number(providerId) : undefined
		return this.exams.findAll(pid)
	}

	@Post()
	create (@Headers('authorization') auth: string | undefined, @Body() dto: CreateExamDto) {
		this.assertAuth(auth)
		return this.exams.create(dto)
	}

	@Put(':id')
	update (
		@Headers('authorization') auth: string | undefined,
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateExamDto,
	) {
		this.assertAuth(auth)
		return this.exams.update(id, dto)
	}

	@Delete(':id')
	remove (@Headers('authorization') auth: string | undefined, @Param('id', ParseIntPipe) id: number) {
		this.assertAuth(auth)
		return this.exams.remove(id)
	}
}


