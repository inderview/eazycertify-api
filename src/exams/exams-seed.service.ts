import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/postgresql'
import { Exam } from './exam.entity'
import { Provider } from '../providers/provider.entity'

interface ExamSeedData {
	providerName: string
	code: string
	title: string
	version: string
	status: 'active'
	timeLimitMinutes: number
	passingScorePercent: number
	totalQuestionsInBank: number
	questionsPerMockTest: number
	price?: number
	purchasable: boolean
	sortOrder: number
	imageUrl?: string
}

@Injectable()
export class ExamsSeederService implements OnModuleInit {
	private readonly logger = new Logger(ExamsSeederService.name)

	constructor (private readonly em: EntityManager) {}

	async onModuleInit (): Promise<void> {
		// Small delay to ensure providers are seeded first
		setTimeout(() => {
			this.seedExams().catch(err => {
				this.logger.error('Failed to seed exams', err)
			})
		}, 1000)
	}

	private async seedExams (): Promise<void> {
		// Fork the entity manager to create a new context
		const em = this.em.fork()
		
		const examsData: ExamSeedData[] = [
			// Microsoft Azure Exams
			{
				providerName: 'Microsoft Azure',
				code: 'AZ-900',
				title: 'Azure Fundamentals',
				version: '1.0',
				status: 'active',
				timeLimitMinutes: 85,
				passingScorePercent: 700,
				totalQuestionsInBank: 285,
				questionsPerMockTest: 60,
				price: 49,
				purchasable: true,
				sortOrder: 1,
			},
			{
				providerName: 'Microsoft Azure',
				code: 'AZ-104',
				title: 'Azure Administrator',
				version: '1.0',
				status: 'active',
				timeLimitMinutes: 120,
				passingScorePercent: 700,
				totalQuestionsInBank: 420,
				questionsPerMockTest: 60,
				price: 69,
				purchasable: true,
				sortOrder: 2,
			},
			{
				providerName: 'Microsoft Azure',
				code: 'AZ-204',
				title: 'Azure Developer Associate',
				version: '1.0',
				status: 'active',
				timeLimitMinutes: 120,
				passingScorePercent: 700,
				totalQuestionsInBank: 380,
				questionsPerMockTest: 60,
				price: 69,
				purchasable: true,
				sortOrder: 3,
			},
			{
				providerName: 'Microsoft Azure',
				code: 'AZ-305',
				title: 'Azure Solutions Architect',
				version: '1.0',
				status: 'active',
				timeLimitMinutes: 120,
				passingScorePercent: 700,
				totalQuestionsInBank: 340,
				questionsPerMockTest: 60,
				price: 69,
				purchasable: true,
				sortOrder: 4,
			},
			// AWS Exams
			{
				providerName: 'Amazon AWS',
				code: 'SAA-C03',
				title: 'Solutions Architect Associate',
				version: 'C03',
				status: 'active',
				timeLimitMinutes: 130,
				passingScorePercent: 720,
				totalQuestionsInBank: 520,
				questionsPerMockTest: 65,
				price: 69,
				purchasable: true,
				sortOrder: 5,
			},
			{
				providerName: 'Amazon AWS',
				code: 'CLF-C02',
				title: 'Cloud Practitioner',
				version: 'C02',
				status: 'active',
				timeLimitMinutes: 90,
				passingScorePercent: 700,
				totalQuestionsInBank: 380,
				questionsPerMockTest: 65,
				price: 49,
				purchasable: true,
				sortOrder: 6,
			},
			{
				providerName: 'Amazon AWS',
				code: 'DVA-C02',
				title: 'Developer Associate',
				version: 'C02',
				status: 'active',
				timeLimitMinutes: 130,
				passingScorePercent: 720,
				totalQuestionsInBank: 290,
				questionsPerMockTest: 65,
				price: 69,
				purchasable: true,
				sortOrder: 7,
			},
			// Google Cloud Exams
			{
				providerName: 'Google Cloud',
				code: 'GCP-ACE',
				title: 'Associate Cloud Engineer',
				version: '1.0',
				status: 'active',
				timeLimitMinutes: 120,
				passingScorePercent: 70,
				totalQuestionsInBank: 245,
				questionsPerMockTest: 50,
				price: 69,
				purchasable: true,
				sortOrder: 8,
			},
			{
				providerName: 'Google Cloud',
				code: 'GCP-PCA',
				title: 'Professional Cloud Architect',
				version: '1.0',
				status: 'active',
				timeLimitMinutes: 120,
				passingScorePercent: 70,
				totalQuestionsInBank: 312,
				questionsPerMockTest: 50,
				price: 79,
				purchasable: true,
				sortOrder: 9,
			},
		]

		for (const examData of examsData) {
			const provider = await em.findOne(Provider, { name: examData.providerName })
			
			if (!provider) {
				this.logger.warn(`Provider not found: ${examData.providerName}, skipping exam ${examData.code}`)
				continue
			}

			const existing = await em.findOne(Exam, { code: examData.code })
			
			if (!existing) {
				const exam = em.create(Exam, {
					providerId: provider.id,
					code: examData.code,
					title: examData.title,
					version: examData.version,
					status: examData.status,
					timeLimitMinutes: examData.timeLimitMinutes,
					passingScorePercent: examData.passingScorePercent,
					totalQuestionsInBank: examData.totalQuestionsInBank,
					questionsPerMockTest: examData.questionsPerMockTest,
					price: examData.price,
					purchasable: examData.purchasable,
					sortOrder: examData.sortOrder,
					imageUrl: examData.imageUrl,
					createdAt: new Date(),
				})
				await em.persistAndFlush(exam)
				this.logger.log(`Seeded exam: ${examData.code} - ${examData.title}`)
			} else {
				this.logger.debug(`Exam already exists: ${examData.code}`)
			}
		}
	}
}
