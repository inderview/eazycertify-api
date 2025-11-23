import { Injectable, UnauthorizedException } from '@nestjs/common'
import { sign, verify } from 'jsonwebtoken'
import { SimpleRateLimiter } from './rate-limiter'
import type { AdminRole, AdminUser } from './admin.types'
import { EntityManager } from '@mikro-orm/postgresql'
import { AdminUser as AdminUserEntity } from './admin-user.entity'

@Injectable()
export class AdminService {
	private readonly limiter = new SimpleRateLimiter(15 * 60 * 1000, 10) // 10 attempts / 15 minutes

	private readonly jwtSecret = process.env.ADMIN_JWT_SECRET ?? 'dev-admin-secret'

	constructor (private readonly em: EntityManager) {}

	async validateLogin (email: string, password: string, clientKey: string): Promise<{ token: string, role: AdminRole }> {
		if (this.limiter.isLimited(clientKey)) {
			throw new UnauthorizedException('Too many attempts. Try again later.')
		}

		const normalizedEmail = email.trim().toLowerCase()
		const user = await this.em.findOne(AdminUserEntity, { email: normalizedEmail })

		this.limiter.recordAttempt(clientKey) // count every attempt (success or fail)

		if (!user || (user as unknown as AdminUser).password !== password) {
			throw new UnauthorizedException('Invalid credentials')
		}

		const casted = user as unknown as AdminUser
		const token = sign({ sub: casted.email, role: casted.role }, this.jwtSecret, { expiresIn: '2h' })
		return { token, role: casted.role }
	}

	verifyToken (token: string): { email: string, role: AdminRole } {
		try {
			const payload = verify(token, this.jwtSecret) as { sub: string, role: AdminRole }
			return { email: payload.sub, role: payload.role }
		} catch {
			throw new UnauthorizedException('Invalid token')
		}
	}

	getDummyStats () {
		// Placeholder numbers; replace with real queries later
		return {
			totalUsers: 12345,
			totalUsersToday: 27,
			totalSubscribedToday: 8,
			revenueToday: 349.99,
			overallRevenue: 98765.43,
			overallUsers: 12345,
			overallActiveSubscriptions: 512,
			totalExams: 42,
			totalProviders: 9,
		}
	}
}


