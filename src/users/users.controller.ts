import { Body, Controller, Get, Post, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { SyncUserDto } from './dto/sync-user.dto';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { AdminGuard } from '../admin/admin.guard';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  @UseGuards(SupabaseJwtGuard)
  async syncUser(@Body() dto: SyncUserDto, @Req() req: any) {
    // Verify that the ID in the body matches the token ID to prevent spoofing
    const userIdFromToken = req.authUser?.sub;
    
    if (!userIdFromToken || userIdFromToken !== dto.id) {
      throw new UnauthorizedException('User ID mismatch');
    }

    return this.usersService.syncUser(dto);
  }

  @Get()
  @UseGuards(AdminGuard)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: User[], total: number, page: number, totalPages: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.usersService.findAll(pageNum, limitNum);
  }
}
