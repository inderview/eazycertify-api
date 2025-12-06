import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/postgresql'
import { Testimonial } from './testimonial.entity'

@Injectable()
export class TestimonialsService {
	constructor(
		@InjectRepository(Testimonial)
		private readonly testimonialRepository: EntityRepository<Testimonial>,
	) {}

	async findAllApproved() {
		return this.testimonialRepository.find(
			{ isApproved: true },
			{ orderBy: { createdAt: 'DESC' } },
		)
	}

	async create(data: { name: string; role?: string; content: string; rating: number }) {
		const testimonial = this.testimonialRepository.create({
			...data,
			isApproved: false,
            createdAt: new Date(),
		})
		await this.testimonialRepository.getEntityManager().persistAndFlush(testimonial)
		return testimonial
	}

	async seedDummyData() {
		const count = await this.testimonialRepository.count()
		if (count > 0) return

		const roles = ['Cloud Architect', 'DevOps Engineer', 'System Administrator', 'Network Engineer', 'Security Analyst', 'Software Developer', 'Data Engineer', 'Solutions Architect']
		const exams = ['AZ-305', 'AZ-104', 'AWS SAA-C03', 'Google ACE', 'Cisco CCNA', 'CompTIA Security+', 'AZ-900', 'AWS CLF-C01']
		const comments = [
			'EazyCertify was instrumental in my passing the exam. The questions were incredibly similar to the real thing!',
			'Great platform for practice. The explanations for each answer helped me understand the concepts deeply.',
			'I used this for my exam and passed on the first try. Highly recommended!',
			'The practice tests are top-notch. Very challenging but prepared me well.',
			'Prep was a breeze with EazyCertify. Love the detailed feedback.',
			'Worth every penny. The simulations felt just like the actual exam environment.',
			'I failed my first attempt using other sites, but passed with a high score after using EazyCertify.',
			'Excellent resource. The community feedback on questions is also very helpful.',
			'The best exam simulator I have found so far. Updated content and great UI.',
			'Helped me identify my weak areas quickly. I focused on those and passed!'
		]
		const names = ['Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Robert', 'Jennifer', 'William', 'Lisa', 'Thomas', 'Daniel', 'Karen', 'Nancy', 'Mark']
		const lastNames = ['Johnson', 'Chen', 'Davis', 'Wilson', 'Brown', 'Smith', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia']

		const dummyData: any[] = []

		for (let i = 0; i < 50; i++) {
			const randomName = `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
			const randomRole = roles[Math.floor(Math.random() * roles.length)]
			const randomExam = exams[Math.floor(Math.random() * exams.length)]
			const randomComment = comments[Math.floor(Math.random() * comments.length)]
			
			dummyData.push({
				name: randomName,
				role: randomRole,
				content: `${randomComment} (Exam: ${randomExam})`,
				rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
				isApproved: true,
				createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Random date in past
			})
		}

		for (const data of dummyData) {
			const testimonial = this.testimonialRepository.create(data)
			this.testimonialRepository.getEntityManager().persist(testimonial)
		}
		await this.testimonialRepository.getEntityManager().flush()
	}
}
