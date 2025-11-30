import { Injectable } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/core'
import Stripe from 'stripe'
import { Purchase } from '../purchases/purchase.entity'
import { Exam } from '../exams/exam.entity'

export interface CreateCheckoutSessionDto {
	examId: number
	examCode: string
	examTitle: string
	duration: '1month' | '3months' | '1year'
	withAI: boolean
	userId?: string
	userEmail?: string
}

@Injectable()
export class StripeService {
	private stripe: Stripe

	constructor(private readonly em: EntityManager) {
		const apiKey = process.env.STRIPE_SECRET_KEY
		if (!apiKey) {
			throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
		}
		this.stripe = new Stripe(apiKey, {
			apiVersion: '2025-11-17.clover' as any,
		})
	}

	getPricing(duration: string, withAI: boolean): number {
		const prices = {
			'1month': withAI ? 19.99 : 9.99,
			'3months': withAI ? 39.99 : 19.99,
			'1year': withAI ? 399.99 : 199.99,
		}
		return prices[duration as keyof typeof prices] || 0
	}

	async createCheckoutSession(dto: CreateCheckoutSessionDto): Promise<{ sessionId: string; url: string }> {
		const price = this.getPricing(dto.duration, dto.withAI)
		const priceInCents = Math.round(price * 100)

		const durationLabels = {
			'1month': '1 Month',
			'3months': '3 Months',
			'1year': '1 Year (Unlimited)',
		}

		const session = await this.stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: `${dto.examCode} - ${dto.examTitle}`,
							description: `${durationLabels[dto.duration]} Access${dto.withAI ? ' + AI Assistant' : ''}`,
						},
						unit_amount: priceInCents,
					},
					quantity: 1,
				},
			],
			mode: 'payment',
			success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
			metadata: {
				examId: dto.examId.toString(),
				examCode: dto.examCode,
				duration: dto.duration,
				withAI: dto.withAI.toString(),
				userId: dto.userId || 'guest',
			},
			customer_email: dto.userEmail,
		})

		return {
			sessionId: session.id,
			url: session.url!,
		}
	}

	async getSessionDetails(sessionId: string) {
		try {
			const session = await this.stripe.checkout.sessions.retrieve(sessionId)
			
			if (!session.metadata) {
				throw new Error('Session metadata not found')
			}

			const metadata = session.metadata
			const durationLabels: Record<string, string> = {
				'1month': '1 Month',
				'3months': '3 Months',
				'1year': '1 Year'
			}

			// Calculate expiration date
			const now = new Date()
			const expiresAt = new Date(now)
			
			if (metadata.duration === '1month') {
				expiresAt.setMonth(expiresAt.getMonth() + 1)
			} else if (metadata.duration === '3months') {
				expiresAt.setMonth(expiresAt.getMonth() + 3)
			} else if (metadata.duration === '1year') {
				expiresAt.setFullYear(expiresAt.getFullYear() + 1)
			}

			return {
				examCode: metadata.examCode,
				examTitle: session.line_items?.data[0]?.description || 'Exam Access',
				duration: metadata.duration,
				durationLabel: durationLabels[metadata.duration] || metadata.duration,
				withAI: metadata.withAI === 'true',
				amount: session.amount_total ? session.amount_total / 100 : 0,
				currency: session.currency || 'usd',
				expiresAt: expiresAt.toISOString(),
				customerEmail: session.customer_email,
				paymentStatus: session.payment_status,
			}
		} catch (error) {
			console.error('Error fetching session details:', error)
			throw new Error('Failed to retrieve session details')
		}
	}

	async handleWebhook(signature: string, payload: Buffer): Promise<void> {
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
		if (!webhookSecret) {
			throw new Error('STRIPE_WEBHOOK_SECRET is not defined')
		}

		let event: Stripe.Event
		try {
			event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret)
		} catch (err) {
			console.error(`Webhook signature verification failed: ${(err as Error).message}`)
			throw new Error(`Webhook Error: ${(err as Error).message}`)
		}

		if (event.type === 'checkout.session.completed') {
			const session = event.data.object as Stripe.Checkout.Session
			const metadata = session.metadata
			
			if (metadata && metadata.examId) {
				try {
					const purchase = new Purchase()
					purchase.userId = metadata.userId || 'guest'
					// We use getReference to avoid fetching the exam if we just need the ID for the FK
					// But MikroORM might need the entity if we are persisting a new relation.
					// Let's use em.getReference which creates a proxy.
					purchase.exam = this.em.getReference(Exam, Number(metadata.examId))
					purchase.stripeSessionId = session.id
					purchase.amount = session.amount_total ? session.amount_total / 100 : 0
					purchase.currency = session.currency || 'usd'
					purchase.duration = metadata.duration
					purchase.withAI = metadata.withAI === 'true'
					
					const now = new Date()
					const expiresAt = new Date(now)
					
					if (metadata.duration === '1month') {
						expiresAt.setMonth(expiresAt.getMonth() + 1)
					} else if (metadata.duration === '3months') {
						expiresAt.setMonth(expiresAt.getMonth() + 3)
					} else if (metadata.duration === '1year') {
						expiresAt.setFullYear(expiresAt.getFullYear() + 1)
					}
					purchase.expiresAt = expiresAt

					await this.em.persistAndFlush(purchase)
					console.log(`Purchase recorded for Exam ${metadata.examCode} by User ${purchase.userId}`)
				} catch (error) {
					console.error('Error saving purchase:', error)
					// We don't throw here to avoid Stripe retrying if it's a logic error on our side,
					// but in production you might want to handle this better (e.g. DLQ)
				}
			}
		}
	}
}
