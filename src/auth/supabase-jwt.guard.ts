import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import jwt from 'jsonwebtoken'

export interface AuthUserPayload {
	sub: string
	email?: string
	role?: string
	[key: string]: unknown
}

declare module 'http' {
	interface IncomingMessage {
		authUser?: AuthUserPayload
	}
}

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
	canActivate (context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest<Request & { authUser?: AuthUserPayload }>()
		const authHeader: string | undefined = (req.headers as any)?.authorization
		if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
			throw new UnauthorizedException('Missing bearer token')
		}
		const token = authHeader.slice(7)
		const secret = process.env.SUPABASE_JWT_SECRET
		if (!secret) {
			throw new UnauthorizedException('Auth misconfigured')
		}
		try {
			const payload = jwt.verify(token, secret) as AuthUserPayload
			;(req as any).authUser = payload
			return true
		} catch {
			throw new UnauthorizedException('Invalid token')
		}
	}
}

