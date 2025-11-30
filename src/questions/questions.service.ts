import { Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/postgresql'
import { Question } from './question.entity'
import { QuestionOption } from './question-option.entity'
import { QuestionBlock } from './question-block.entity'
import { QuestionGroup } from './question-group.entity'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'

@Injectable()
export class QuestionsService {
	constructor (private readonly em: EntityManager) {}

	findAll (filters: {
		examId?: number
		difficulty?: string
		status?: string
		flagged?: string
		topic?: string
	}): Promise<Question[]> {
		const where: any = {}
		if (filters.examId) where.examId = filters.examId
		if (filters.difficulty) where.difficulty = filters.difficulty
		if (filters.status) where.status = filters.status
		if (filters.flagged !== undefined) where.flagged = filters.flagged === 'true'
		if (filters.topic) where.topic = filters.topic
		return this.em.find(Question, where, { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] })
	}

	findOptions (questionId: number): Promise<QuestionOption[]> {
		return this.em.find(QuestionOption, { questionId }, { orderBy: { optionOrder: 'asc' } })
	}

	async create (dto: CreateQuestionDto) {
		const q = this.em.create(Question, {
			examId: dto.examId,
			type: dto.type,
			text: dto.text,
			attachments: dto.attachments,
			topic: dto.topic,
			difficulty: dto.difficulty,
			status: dto.status,
			flagged: dto.flagged ?? false,
			orderIndex: dto.orderIndex,
			blockId: dto.blockId,
			explanation: dto.explanation,
			referenceUrl: dto.referenceUrl,
			createdAt: new Date(),
		})
		await this.em.persistAndFlush(q)
		// HOTSPOT/DRAGDROP: groups
		if (dto.groups && dto.groups.length > 0) {
			for (const [gidx, g] of dto.groups.entries()) {
				const group = this.em.create(QuestionGroup, {
					questionId: q.id,
					label: g.label,
					mode: g.mode,
					groupOrder: g.groupOrder ?? gidx + 1,
				})
				await this.em.persistAndFlush(group)
				for (const [oidx, opt] of g.options.entries()) {
					const o = this.em.create(QuestionOption, {
						questionId: q.id,
						groupId: group.id,
						text: opt.text,
						isCorrect: opt.isCorrect,
						optionOrder: opt.optionOrder ?? oidx + 1,
					})
					await this.em.persistAndFlush(o)
				}
			}
		}
		
		// Global options (Distractors or Standard Options)
		if (dto.options && dto.options.length > 0) {
			for (const [idx, opt] of dto.options.entries()) {
				const o = this.em.create(QuestionOption, {
					questionId: q.id,
					text: opt.text,
					isCorrect: opt.isCorrect,
					optionOrder: opt.optionOrder ?? idx + 1,
				})
				await this.em.persistAndFlush(o)
			}
		}
		return q
	}

	async update (id: number, dto: UpdateQuestionDto) {
		const q = await this.em.findOne(Question, { id })
		if (!q) throw new NotFoundException('Question not found')
		Object.assign(q, {
			examId: dto.examId ?? q.examId,
			type: dto.type ?? q.type,
			text: dto.text ?? q.text,
			attachments: dto.attachments ?? q.attachments,
			topic: dto.topic ?? q.topic,
			difficulty: dto.difficulty ?? q.difficulty,
			status: dto.status ?? q.status,
			flagged: dto.flagged ?? q.flagged,
			orderIndex: dto.orderIndex ?? q.orderIndex,
			blockId: dto.blockId ?? q.blockId,
			explanation: dto.explanation ?? q.explanation,
			referenceUrl: dto.referenceUrl ?? q.referenceUrl,
		})
		await this.em.flush()
		
		if (dto.groups) {
			// Replace groups and their options
			const groups = await this.em.find(QuestionGroup, { questionId: id })
			for (const g of groups) await this.em.remove(g).flush()
			
			for (const [gidx, g] of dto.groups.entries()) {
				const group = this.em.create(QuestionGroup, {
					questionId: id,
					label: g.label,
					mode: g.mode,
					groupOrder: g.groupOrder ?? gidx + 1,
				})
				await this.em.persistAndFlush(group)
				for (const [oidx, opt] of g.options.entries()) {
					const o = this.em.create(QuestionOption, {
						questionId: id,
						groupId: group.id,
						text: opt.text,
						isCorrect: opt.isCorrect,
						optionOrder: opt.optionOrder ?? oidx + 1,
					})
					await this.em.persistAndFlush(o)
				}
			}
		}
		
		if (dto.options) {
			// Replace GLOBAL options only (where groupId is null)
			const existing = await this.em.find(QuestionOption, { questionId: id, groupId: null })
			for (const e of existing) await this.em.remove(e).flush()
			
			for (const [idx, opt] of dto.options.entries()) {
				const o = this.em.create(QuestionOption, {
					questionId: id,
					text: opt.text,
					isCorrect: opt.isCorrect,
					optionOrder: opt.optionOrder ?? idx + 1,
				})
				await this.em.persistAndFlush(o)
			}
		}
		return q
	}

	async remove (id: number): Promise<void> {
		const q = await this.em.findOne(Question, { id })
		if (!q) throw new NotFoundException('Question not found')
		await this.em.removeAndFlush(q)
	}

	async getDetail (id: number): Promise<any> {
		const q = await this.em.findOne(Question, { id })
		if (!q) throw new NotFoundException('Question not found')
		const groups = await this.em.find(QuestionGroup, { questionId: id }, { orderBy: { groupOrder: 'asc' } })
		const options = await this.em.find(QuestionOption, { questionId: id }, { orderBy: { optionOrder: 'asc' } })
		const groupsWithOptions = groups.map(g => ({
			id: g.id,
			questionId: g.questionId,
			label: g.label,
			mode: g.mode,
			groupOrder: g.groupOrder,
			options: options
				.filter(o => o.groupId === g.id)
				.map(o => ({
					id: o.id,
					questionId: o.questionId,
					groupId: o.groupId,
					text: o.text,
					isCorrect: o.isCorrect,
					optionOrder: o.optionOrder,
				})),
		}))
		return {
			question: {
				id: q.id,
				examId: q.examId,
				type: q.type,
				text: q.text,
				attachments: q.attachments,
				topic: q.topic,
				difficulty: q.difficulty,
				status: q.status,
				flagged: q.flagged,
				orderIndex: q.orderIndex,
				blockId: q.blockId,
				explanation: q.explanation,
				referenceUrl: q.referenceUrl,
				createdAt: q.createdAt,
				updatedAt: q.updatedAt,
			},
			options: options
				.filter(o => !o.groupId)
				.map(o => ({
					id: o.id,
					questionId: o.questionId,
					text: o.text,
					isCorrect: o.isCorrect,
					optionOrder: o.optionOrder,
				})),
			groups: groupsWithOptions,
		}
	}

	// Blocks
	findBlocks (): Promise<QuestionBlock[]> {
		return this.em.find(QuestionBlock, {}, { orderBy: { id: 'desc' } })
	}

	async createBlock (title: string, scenario: string, images?: string) {
		const b = this.em.create(QuestionBlock, { title, scenario, images, createdAt: new Date() })
		await this.em.persistAndFlush(b)
		return b
	}

	async updateBlock (id: number, data: Partial<QuestionBlock>) {
		const b = await this.em.findOne(QuestionBlock, { id })
		if (!b) throw new NotFoundException('Block not found')
		Object.assign(b, data)
		await this.em.flush()
		return b
	}

	async removeBlock (id: number) {
		const b = await this.em.findOne(QuestionBlock, { id })
		if (!b) throw new NotFoundException('Block not found')
		await this.em.removeAndFlush(b)
	}
}


