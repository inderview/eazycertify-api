import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/postgresql'
import { ExamAttempt } from './attempt.entity'
import { AttemptAnswer } from './attempt-answer.entity'
import { Exam } from '../exams/exam.entity'
import { Question } from '../questions/question.entity'
import { QuestionOption } from '../questions/question-option.entity'
import { QuestionGroup } from '../questions/question-group.entity'
import { CreateAttemptDto } from './dto/create-attempt.dto'
import { SaveAnswerDto } from './dto/save-answer.dto'

@Injectable()
export class AttemptsService {
	constructor(private readonly em: EntityManager) {}

	async createAttempt(userId: string, dto: CreateAttemptDto): Promise<ExamAttempt> {
		try {
			console.log('Creating attempt for user:', userId, 'dto:', dto)
			
			// Find the exam
			const exam = await this.em.findOne(Exam, { id: dto.examId })
			if (!exam) {
				console.error('Exam not found:', dto.examId)
				throw new NotFoundException('Exam not found')
			}

			console.log('Exam found:', exam.id, exam.title, 'questionsPerMockTest:', exam.questionsPerMockTest)

			// Get random questions based on exam configuration
			const questions = await this.selectQuestions(exam)
			console.log('Selected questions count:', questions.length, 'required:', exam.questionsPerMockTest)

			if (questions.length < exam.questionsPerMockTest) {
				console.error('Not enough questions. Need:', exam.questionsPerMockTest, 'Found:', questions.length)
				throw new BadRequestException(
					`Not enough questions available. Need ${exam.questionsPerMockTest}, found ${questions.length}`
				)
			}

			// Create the attempt
			const attempt = this.em.create(ExamAttempt, {
				userId,
				examId: exam.id,
				status: 'in_progress',
				questionIds: questions.map(q => q.id),
				totalQuestions: questions.length,
				startedAt: new Date(),
				expiresAt: new Date(Date.now() + exam.timeLimitMinutes * 60 * 1000),
				metadata: {
					deviceFingerprint: dto.deviceFingerprint,
					ipAddress: dto.ipAddress,
					userAgent: dto.userAgent,
				},
				createdAt: new Date(),
			})

			console.log('Attempt created, persisting...')
			await this.em.persistAndFlush(attempt)
			console.log('Attempt persisted with id:', attempt.id)

			// Create empty answer records for all questions
			for (const question of questions) {
				const answer = this.em.create(AttemptAnswer, {
					attemptId: attempt.id,
					questionId: question.id,
					isMarkedForReview: false,
					createdAt: new Date(),
				})
				this.em.persist(answer)
			}

			await this.em.flush()
			console.log('All answer records created')

			return attempt
		} catch (error) {
			console.error('Error in createAttempt:', error)
			throw error
		}
	}

	private async selectQuestions(exam: Exam): Promise<Question[]> {
		const config = exam.configuration
		let questions: Question[] = []

		if (config?.topicDistribution && Object.keys(config.topicDistribution).length > 0) {
			const topicQuestions = await this.selectByTopicDistribution(exam.id, config.topicDistribution)
			questions = this.mergeUniqueQuestions([], topicQuestions)
		}

		if (questions.length < exam.questionsPerMockTest && config?.typeDistribution && Object.keys(config.typeDistribution).length > 0) {
			const typeQuestions = await this.selectByTypeDistribution(exam.id, config.typeDistribution)
			questions = this.mergeUniqueQuestions(questions, typeQuestions)
		}

		if (questions.length < exam.questionsPerMockTest) {
			const fillers = await this.fetchRandomQuestions(
				exam.id,
				exam.questionsPerMockTest - questions.length,
				questions.map(q => q.id),
			)
			questions = [...questions, ...fillers]
		}

		if (questions.length === 0) {
			const fallback = await this.fetchRandomQuestions(exam.id, exam.questionsPerMockTest, [])
			questions = fallback
		}

		return this.shuffleArray(questions).slice(0, exam.questionsPerMockTest)
	}

	private async selectByTopicDistribution(
		examId: number,
		distribution: Record<string, number>
	): Promise<Question[]> {
		const selected: Question[] = []

		for (const [topic, count] of Object.entries(distribution)) {
			const questions = await this.em.find(
				Question,
				{ examId, status: 'published', topic },
				{ limit: count * 2 } // Get more to allow for randomization
			)

			const shuffled = this.shuffleArray(questions)
			selected.push(...shuffled.slice(0, count))
		}

		return this.shuffleArray(selected)
	}

	private async selectByTypeDistribution(
		examId: number,
		distribution: Record<string, number>
	): Promise<Question[]> {
		const selected: Question[] = []

		for (const [type, count] of Object.entries(distribution)) {
			const questions = await this.em.find(
				Question,
				{ examId, status: 'published', type: type as any },
				{ limit: count * 2 }
			)

			const shuffled = this.shuffleArray(questions)
			selected.push(...shuffled.slice(0, count))
		}

		return this.shuffleArray(selected)
	}

	private async fetchRandomQuestions(examId: number, needed: number, excludeIds: number[]): Promise<Question[]> {
		if (needed <= 0) {
			return []
		}

		const where: any = { examId, status: 'published' }
		if (excludeIds.length > 0) {
			where.id = { $nin: excludeIds }
		}

		const candidates = await this.em.find(
			Question,
			where,
			{ limit: needed * 3, orderBy: { id: 'ASC' } }
		)

		return this.shuffleArray(candidates).slice(0, needed)
	}

	private mergeUniqueQuestions(existing: Question[], incoming: Question[]): Question[] {
		const map = new Map<number, Question>()
		for (const question of existing) {
			map.set(question.id, question)
		}
		for (const question of incoming) {
			if (!map.has(question.id)) {
				map.set(question.id, question)
			}
		}
		return Array.from(map.values())
	}

	private shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array]
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
		}
		return shuffled
	}

	async getAttempt(attemptId: number, userId: string): Promise<ExamAttempt> {
		const attempt = await this.em.findOne(ExamAttempt, { id: attemptId, userId })
		if (!attempt) {
			throw new NotFoundException('Attempt not found')
		}
		return attempt
	}

	async saveAnswer(userId: string, dto: SaveAnswerDto): Promise<AttemptAnswer> {
		// Verify the attempt belongs to the user
		const attempt = await this.em.findOne(ExamAttempt, { id: dto.attemptId, userId })
		if (!attempt) {
			throw new NotFoundException('Attempt not found')
		}

		if (attempt.status !== 'in_progress') {
			throw new BadRequestException('Cannot save answer for a completed attempt')
		}

		// Find or create the answer record
		let answer = await this.em.findOne(AttemptAnswer, {
			attemptId: dto.attemptId,
			questionId: dto.questionId,
		})

		if (!answer) {
			answer = this.em.create(AttemptAnswer, {
				attemptId: dto.attemptId,
				questionId: dto.questionId,
				isMarkedForReview: false,
				createdAt: new Date(),
			})
		}

		answer.selectedAnswer = dto.selectedAnswer
		answer.isMarkedForReview = dto.isMarkedForReview ?? answer.isMarkedForReview
		answer.timeSpentSeconds = dto.timeSpentSeconds ?? answer.timeSpentSeconds
		answer.answeredAt = new Date()

		await this.em.persistAndFlush(answer)
		return answer
	}

	async submitAttempt(attemptId: number, userId: string): Promise<ExamAttempt> {
		const attempt = await this.em.findOne(ExamAttempt, { id: attemptId, userId })
		if (!attempt) {
			throw new NotFoundException('Attempt not found')
		}

		if (attempt.status !== 'in_progress') {
			throw new BadRequestException('Attempt already completed')
		}

		// Get all answers
		const answers = await this.em.find(AttemptAnswer, { attemptId: attempt.id })

		// Calculate score
		let correctCount = 0
		for (const answer of answers) {
			const question = await this.em.findOne(Question, { id: answer.questionId })
			if (!question) continue

			const isCorrect = await this.checkAnswer(question, answer.selectedAnswer)
			answer.isCorrect = isCorrect
			if (isCorrect) correctCount++
		}

		await this.em.flush()

		// Update attempt
		attempt.status = 'completed'
		attempt.completedAt = new Date()
		attempt.correctAnswers = correctCount
		attempt.score = Math.round((correctCount / attempt.totalQuestions!) * 100)

		await this.em.flush()

		return attempt
	}

	private async checkAnswer(question: Question, selectedAnswer: any): Promise<boolean> {
		// Get the correct options
		const options = await this.em.find(
			this.em.getRepository('QuestionOption').getEntityName(),
			{ questionId: question.id }
		)

		const correctOptions = options.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.id)

		if (question.type === 'single') {
			return correctOptions.includes(selectedAnswer)
		} else if (question.type === 'multi') {
			if (!Array.isArray(selectedAnswer)) return false
			return (
				selectedAnswer.length === correctOptions.length &&
				selectedAnswer.every(id => correctOptions.includes(id))
			)
		}

		// For other types, implement specific logic as needed
		return false
	}

	async getAttemptWithAnswers(attemptId: number, userId: string) {
		const attempt = await this.em.findOne(ExamAttempt, { id: attemptId, userId })
		if (!attempt) {
			throw new NotFoundException('Attempt not found')
		}

		const answers = await this.em.find(AttemptAnswer, { attemptId: attempt.id })
		const questionIds = attempt.questionIds || []
		const questions = await this.em.find(Question, { id: { $in: questionIds } })
		const options = await this.em.find(QuestionOption, { questionId: { $in: questionIds } })
		const groups = await this.em.find(QuestionGroup, { questionId: { $in: questionIds } })

		const optionsMap = options.reduce<Map<number, QuestionOption[]>>((map, option) => {
			const list = map.get(option.questionId) || []
			list.push(option)
			map.set(option.questionId, list)
			return map
		}, new Map())

		const groupsMap = groups.reduce<Map<number, QuestionGroup[]>>((map, group) => {
			const list = map.get(group.questionId) || []
			list.push(group)
			map.set(group.questionId, list)
			return map
		}, new Map())

		const orderedQuestions = questionIds
			.map(questionId => {
				const question = questions.find(q => q.id === questionId)
				if (!question) {
					return undefined
				}
				const questionOptions = (optionsMap.get(question.id) || []).sort((a, b) => {
					const orderA = a.optionOrder ?? a.id
					const orderB = b.optionOrder ?? b.id
					return orderA - orderB
				})
				const questionGroups = (groupsMap.get(question.id) || []).sort((a, b) => {
					const orderA = a.groupOrder ?? a.id
					const orderB = b.groupOrder ?? b.id
					return orderA - orderB
				})
				return {
					id: question.id,
					examId: question.examId,
					type: question.type,
					text: question.text,
					explanation: question.explanation,
					topic: question.topic,
					status: question.status,
					question_option: questionOptions.map(option => ({
						id: option.id,
						text: option.text,
						isCorrect: option.isCorrect,
						optionOrder: option.optionOrder,
						groupId: option.groupId,
					})),
					question_group: questionGroups.map(group => ({
						id: group.id,
						label: group.label,
						mode: group.mode,
						groupOrder: group.groupOrder,
					})),
				}
			})
			.filter((question): question is NonNullable<typeof question> => Boolean(question))

		const exam = await this.em.findOne(Exam, { id: attempt.examId })

		return {
			attempt,
			answers,
			questions: orderedQuestions,
			exam: exam
				? {
						id: exam.id,
						code: exam.code,
						title: exam.title,
						questionsPerMockTest: exam.questionsPerMockTest,
					}
				: undefined,
		}
	}
}
