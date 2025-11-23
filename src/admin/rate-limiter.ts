type Timestamp = number

export class SimpleRateLimiter {
	private attemptsByKey = new Map<string, Timestamp[]>()

	constructor (
		private readonly windowMs: number,
		private readonly maxAttempts: number,
	) {}

	recordAttempt (key: string): void {
		const now = Date.now()
		const windowStart = now - this.windowMs
		const attempts = (this.attemptsByKey.get(key) ?? []).filter(ts => ts >= windowStart)
		attempts.push(now)
		this.attemptsByKey.set(key, attempts)
	}

	isLimited (key: string): boolean {
		const now = Date.now()
		const windowStart = now - this.windowMs
		const attempts = (this.attemptsByKey.get(key) ?? []).filter(ts => ts >= windowStart)
		this.attemptsByKey.set(key, attempts)
		return attempts.length >= this.maxAttempts
	}
}


