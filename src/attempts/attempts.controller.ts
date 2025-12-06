import { Controller, Post, Get, Body, Param, Request, BadRequestException } from '@nestjs/common'
import { AttemptsService } from './attempts.service'
import { CreateAttemptDto } from './dto/create-attempt.dto'
import { SaveAnswerDto } from './dto/save-answer.dto'

@Controller('attempts')
export class AttemptsController {
	constructor(private readonly attemptsService: AttemptsService) {}

	@Post()
	async createAttempt(@Request() req: any, @Body() dto: CreateAttemptDto) {
		const userId = this.resolveUserId(req, dto.userId)
		return this.attemptsService.createAttempt(userId, dto)
	}

	@Get(':id')
	async getAttempt(@Param('id') id: string, @Request() req: any) {
		const userId = this.resolveUserId(req)
		return this.attemptsService.getAttemptWithAnswers(parseInt(id), userId)
	}

	@Post('answer')
	async saveAnswer(@Request() req: any, @Body() dto: SaveAnswerDto) {
		const userId = this.resolveUserId(req, (dto as any).userId)
		return this.attemptsService.saveAnswer(userId, dto)
	}

	@Post(':id/submit')
	async submitAttempt(@Param('id') id: string, @Request() req: any) {
		const userId = this.resolveUserId(req, req.body?.userId)
		return this.attemptsService.submitAttempt(parseInt(id), userId)
	}

	private resolveUserId(req: any, fallback?: string): string {
		const userId =
			req.user?.id ||
			fallback ||
			req.headers?.['x-user-id'] ||
			req.query?.userId ||
			req.body?.userId

		if (!userId) {
			throw new BadRequestException('User ID is required')
		}

		return userId
	}
}
