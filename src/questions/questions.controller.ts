import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { QuestionsService } from './questions.service'
import { AdminService } from '../admin/admin.service'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'

@Controller('admin')
export class QuestionsController {
	constructor (private readonly service: QuestionsService, private readonly admin: AdminService) {}

	private assertAuth (authHeader?: string): void {
		if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized')
		const token = authHeader.slice('Bearer '.length)
		this.admin.verifyToken(token)
	}

	@Get('questions')
	findAll (
		@Headers('authorization') auth?: string,
		@Query('examId') examId?: string,
		@Query('difficulty') difficulty?: string,
		@Query('status') status?: string,
		@Query('flagged') flagged?: string,
		@Query('topic') topic?: string,
	) {
		this.assertAuth(auth)
		return this.service.findAll({
			examId: examId ? Number(examId) : undefined,
			difficulty,
			status,
			flagged,
			topic,
		})
	}

	@Get('questions/:id/options')
	findOptions (@Headers('authorization') auth?: string, @Param('id', ParseIntPipe) id?: number) {
		this.assertAuth(auth)
		return this.service.findOptions(id!)
	}

	@Post('questions')
	create (@Headers('authorization') auth: string | undefined, @Body() dto: CreateQuestionDto) {
		this.assertAuth(auth)
		return this.service.create(dto)
	}

	@Put('questions/:id')
	update (
		@Headers('authorization') auth: string | undefined,
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateQuestionDto,
	) {
		this.assertAuth(auth)
		return this.service.update(id, dto)
	}

	@Delete('questions/:id')
	remove (@Headers('authorization') auth: string | undefined, @Param('id', ParseIntPipe) id: number) {
		this.assertAuth(auth)
		return this.service.remove(id)
	}

	@Get('questions/:id/detail')
	getDetail (@Headers('authorization') auth?: string, @Param('id', ParseIntPipe) id?: number): Promise<any> {
		this.assertAuth(auth)
		return this.service.getDetail(id!)
	}

	// Blocks
	@Get('blocks')
	blocks (@Headers('authorization') auth?: string) {
		this.assertAuth(auth)
		return this.service.findBlocks()
	}

	@Post('blocks')
	createBlock (@Headers('authorization') auth: string | undefined, @Body() body: { title: string, scenario: string, images?: string }) {
		this.assertAuth(auth)
		return this.service.createBlock(body.title, body.scenario, body.images)
	}

	@Put('blocks/:id')
	updateBlock (@Headers('authorization') auth: string | undefined, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
		this.assertAuth(auth)
		return this.service.updateBlock(id, body)
	}

	@Delete('blocks/:id')
	removeBlock (@Headers('authorization') auth: string | undefined, @Param('id', ParseIntPipe) id: number) {
		this.assertAuth(auth)
		return this.service.removeBlock(id)
	}
}


