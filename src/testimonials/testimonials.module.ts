import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Testimonial } from './testimonial.entity'
import { TestimonialsController } from './testimonials.controller'
import { TestimonialsService } from './testimonials.service'

@Module({
	imports: [MikroOrmModule.forFeature([Testimonial])],
	controllers: [TestimonialsController],
	providers: [TestimonialsService],
	exports: [TestimonialsService],
})
export class TestimonialsModule {}
