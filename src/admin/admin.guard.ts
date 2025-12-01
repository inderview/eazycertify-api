import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AdminService } from './admin.service'

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly adminService: AdminService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    const authHeader: string | undefined = req.headers?.authorization
    
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Missing bearer token')
    }
    
    const token = authHeader.slice(7)
    
    try {
      const payload = this.adminService.verifyToken(token)
      req.adminUser = payload
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired admin token')
    }
  }
}
