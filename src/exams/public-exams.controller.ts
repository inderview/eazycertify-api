import { Controller, Get } from '@nestjs/common'
import { ExamsService } from './exams.service'
import { EntityManager } from '@mikro-orm/postgresql'

@Controller('exams')
export class PublicExamsController {
	constructor (
		private readonly exams: ExamsService,
		private readonly em: EntityManager,
	) {}

	@Get()
	async findAll () {
		// Get exams with provider information joined
		const result = await this.em.execute(`
			SELECT 
				e.id,
				e.code,
				e.title,
				e.version,
				e.status,
				e.time_limit_minutes as "timeLimitMinutes",
				e.passing_score_percent as "passingScorePercent",
				e.total_questions_in_bank as "totalQuestionsInBank",
				e.questions_per_mock_test as "questionsPerMockTest",
				e.price,
				e.purchasable,
				e.sort_order as "sortOrder",
				e.image_url as "imageUrl",
				e.created_at as "createdAt",
				e.updated_at as "updatedAt",
				p.id as "providerId",
				p.name as "providerName",
				p.logo_url as "providerLogoUrl"
			FROM exam e
			INNER JOIN provider p ON e.provider_id = p.id
			WHERE e.status = 'active'
			ORDER BY e.sort_order ASC, e.id ASC
		`)
		
		return result
	}
}
