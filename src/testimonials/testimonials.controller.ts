import { Body, Controller, Get, Post } from '@nestjs/common'
import { TestimonialsService } from './testimonials.service'

@Controller('testimonials')
export class TestimonialsController {
	constructor(private readonly testimonialsService: TestimonialsService) {}

	@Get()
	async findAll() {
        // Auto-seed if empty (for demo purposes)
        await this.testimonialsService.seedDummyData()
		return this.testimonialsService.findAllApproved()
	}

	@Post()
	async create(@Body() body: { name: string; role?: string; content: string; rating: number }) {
		return this.testimonialsService.create(body)
	}
}
