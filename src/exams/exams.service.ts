import { Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/postgresql'
import { Exam } from './exam.entity'
import { CreateExamDto } from './dto/create-exam.dto'
import { UpdateExamDto } from './dto/update-exam.dto'

@Injectable()
export class ExamsService {
	constructor (private readonly em: EntityManager) {}

	findAll (providerId?: number): Promise<Exam[]> {
		const where = providerId ? { providerId } : {}
		return this.em.find(Exam, where, { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] })
	}

	findActive (): Promise<Exam[]> {
		return this.em.find(Exam, { status: 'active' }, { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] })
	}

	async create (dto: CreateExamDto): Promise<Exam> {
		try {
			const exam = this.em.create(Exam, {
				providerId: dto.providerId,
				code: dto.code.trim(),
				title: dto.title.trim(),
				version: dto.version.trim(),
				status: dto.status,
				timeLimitMinutes: dto.timeLimitMinutes,
				passingScorePercent: dto.passingScorePercent,
				totalQuestionsInBank: dto.totalQuestionsInBank,
				questionsPerMockTest: dto.questionsPerMockTest,
				price: dto.price,
				purchasable: dto.purchasable ?? false,
				sortOrder: dto.sortOrder,
				imageUrl: dto.imageUrl,
				configuration: dto.configuration,
				createdAt: new Date(),
			})
			await this.em.persistAndFlush(exam)
			return exam
		} catch (error: any) {
			console.error('Error creating exam:', error)
			throw new Error(`Failed to create exam: ${error.message}`)
		}
	}

	async update (id: number, dto: UpdateExamDto): Promise<Exam> {
		const exam = await this.em.findOne(Exam, { id })
		if (!exam) throw new NotFoundException('Exam not found')
		if (dto.providerId !== undefined) exam.providerId = dto.providerId
		if (dto.code !== undefined) exam.code = dto.code.trim()
		if (dto.title !== undefined) exam.title = dto.title.trim()
		if (dto.version !== undefined) exam.version = dto.version.trim()
		if (dto.status !== undefined) exam.status = dto.status
		if (dto.timeLimitMinutes !== undefined) exam.timeLimitMinutes = dto.timeLimitMinutes
		if (dto.passingScorePercent !== undefined) exam.passingScorePercent = dto.passingScorePercent
		if (dto.totalQuestionsInBank !== undefined) exam.totalQuestionsInBank = dto.totalQuestionsInBank
		if (dto.questionsPerMockTest !== undefined) exam.questionsPerMockTest = dto.questionsPerMockTest
		if (dto.price !== undefined) exam.price = dto.price
		if (dto.purchasable !== undefined) exam.purchasable = dto.purchasable
		if (dto.sortOrder !== undefined) exam.sortOrder = dto.sortOrder
		if (dto.imageUrl !== undefined) exam.imageUrl = dto.imageUrl
		if (dto.configuration !== undefined) exam.configuration = dto.configuration
		await this.em.flush()
		return exam
	}

	async remove (id: number): Promise<void> {
		const exam = await this.em.findOne(Exam, { id })
		if (!exam) throw new NotFoundException('Exam not found')
		await this.em.removeAndFlush(exam)
	}
}


