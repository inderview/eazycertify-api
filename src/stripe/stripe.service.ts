import { Injectable } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/core'
import Stripe from 'stripe'
import { Purchase } from '../purchases/purchase.entity'
import { PurchaseAuditLog } from '../purchases/purchase-audit-log.entity'
import { Exam } from '../exams/exam.entity'

type PurchaseRecordSource = 'webhook' | 'success-page'

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

		const metadata: Record<string, string> = {
			examId: dto.examId.toString(),
			examCode: dto.examCode,
			duration: dto.duration,
			withAI: dto.withAI.toString(),
			userId: dto.userId || 'guest',
		}

		if (dto.userEmail) {
			metadata.userEmail = dto.userEmail
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
			metadata,
			customer_email: dto.userEmail,
		})

		return {
			sessionId: session.id,
			url: session.url!,
		}
	}

	async getSessionDetails(sessionId: string) {
		try {
			const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
				expand: ['line_items'],
			})
			
			if (!session.metadata) {
				throw new Error('Session metadata not found')
			}

			const metadata = session.metadata
			const durationValue = metadata.duration || '1month'
			const durationLabels: Record<string, string> = {
				'1month': '1 Month',
				'3months': '3 Months',
				'1year': '1 Year'
			}
			const expiresAt = this.calculateExpiration(durationValue)

			await this.recordPurchaseFromSession(session, 'success-page')

			return {
				examCode: metadata.examCode,
				examTitle: session.line_items?.data[0]?.description || 'Exam Access',
				duration: durationValue,
				durationLabel: durationLabels[durationValue] || durationValue,
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
			await this.recordPurchaseFromSession(session, 'webhook')
		}
	}

	private calculateExpiration(duration?: string): Date {
		const expiresAt = new Date()
		if (duration === '3months') {
			expiresAt.setMonth(expiresAt.getMonth() + 3)
			return expiresAt
		}
		if (duration === '1year') {
			expiresAt.setFullYear(expiresAt.getFullYear() + 1)
			return expiresAt
		}
		expiresAt.setMonth(expiresAt.getMonth() + 1)
		return expiresAt
	}

	private async recordPurchaseFromSession(
		session: Stripe.Checkout.Session,
		source: PurchaseRecordSource,
	): Promise<Purchase | null> {
		const metadata = session.metadata
		if (!metadata?.examId) {
			console.warn('Stripe session missing exam metadata', { sessionId: session.id })
			return null
		}
		if (session.payment_status !== 'paid') {
			return null
		}
		const examId = Number(metadata.examId)
		if (!Number.isInteger(examId)) {
			console.warn('Invalid examId in stripe metadata', { examId: metadata.examId })
			return null
		}
		const em = this.em.fork()
		const existing = await em.findOne(Purchase, { stripeSessionId: session.id })
		if (existing) {
			const email = session.customer_details?.email || session.customer_email || metadata.userEmail
			if (!existing.userEmail && email) {
				existing.userEmail = email
				await em.flush()
			}
			return existing
		}
		const withAI = metadata.withAI === 'true'
		const durationValue = metadata.duration || '1month'
		const userId = metadata.userId || 'guest'
		const email = session.customer_details?.email || session.customer_email || metadata.userEmail || undefined
		const purchase = new Purchase()
		purchase.userId = userId
		purchase.userEmail = email
		purchase.exam = em.getReference(Exam, examId)
		purchase.stripeSessionId = session.id
		purchase.amount = session.amount_total ? session.amount_total / 100 : this.getPricing(durationValue, withAI)
		purchase.currency = session.currency || 'usd'
		purchase.duration = durationValue
		purchase.withAI = withAI
		purchase.expiresAt = this.calculateExpiration(durationValue)
		await em.persist(purchase)
		const auditLog = new PurchaseAuditLog()
		auditLog.purchase = purchase
		auditLog.action = 'purchase_created'
		auditLog.reason = `Purchase recorded via ${source}`
		auditLog.metadata = JSON.stringify({
			source,
			stripeSessionId: session.id,
			paymentStatus: session.payment_status,
			examId,
		})
		await em.persist(auditLog)
		await em.flush()
		console.log(`Purchase recorded for Exam ${metadata.examCode || examId} by User ${purchase.userId} via ${source}`)
		return purchase
	}
}
