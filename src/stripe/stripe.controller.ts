import { Controller, Post, Body, Headers, Req } from '@nestjs/common'
import type { RawBodyRequest } from '@nestjs/common'
import type { Request } from 'express'
import { StripeService } from './stripe.service'
import type { CreateCheckoutSessionDto } from './stripe.service'

@Controller('stripe')
export class StripeController {
	constructor(private readonly stripeService: StripeService) {}

	@Post('create-checkout-session')
	async createCheckoutSession(@Body() dto: CreateCheckoutSessionDto) {
		return this.stripeService.createCheckoutSession(dto)
	}

	@Post('webhook')
	async handleWebhook(
		@Headers('stripe-signature') signature: string,
		@Req() request: RawBodyRequest<any>,
	) {
		const payload = request.rawBody
		if (!payload) {
			throw new Error('No raw body')
		}
		await this.stripeService.handleWebhook(signature, payload)
		return { received: true }
	}
}
