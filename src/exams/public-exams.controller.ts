import { Controller, Get, Query } from '@nestjs/common'
import { ExamsService } from './exams.service'
import { EntityManager } from '@mikro-orm/postgresql'

@Controller('exams')
export class PublicExamsController {
	constructor (
		private readonly exams: ExamsService,
		private readonly em: EntityManager,
	) {}

	@Get('providers')
	async getProviders () {
		const result = await this.em.execute(`
			SELECT 
				p.id, 
				p.name, 
				p.logo_url as "logoUrl", 
				COUNT(e.id)::int as "examCount"
			FROM provider p
			LEFT JOIN exam e ON p.id = e.provider_id AND e.status = 'active'
			GROUP BY p.id
			ORDER BY p.sort_order ASC, p.name ASC
		`)
		return result
	}

	@Get()
	async findAll (
		@Query('providerId') providerId?: string,
		@Query('search') search?: string,
		@Query('sort') sort?: string
	) {
		let query = `
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
		`
		
		const params: any[] = []

		if (providerId) {
			query += ` AND p.id = ?`
			params.push(Number(providerId))
		}

		if (search) {
			query += ` AND (LOWER(e.code) LIKE ? OR LOWER(e.title) LIKE ?)`
			params.push(`%${search.toLowerCase()}%`)
			params.push(`%${search.toLowerCase()}%`)
		}

		// Sorting
		if (sort === 'recent') {
			query += ` ORDER BY e.updated_at DESC`
		} else if (sort === 'popular') {
			// Assuming popular means more questions or just random for now as we don't have view counts
			query += ` ORDER BY e.total_questions_in_bank DESC` 
		} else {
			query += ` ORDER BY e.sort_order ASC, e.id ASC`
		}

		const result = await this.em.execute(query, params)
		
		return result
	}
}
