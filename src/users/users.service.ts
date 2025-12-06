import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from './user.entity';
import { SyncUserDto } from './dto/sync-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly em: EntityManager) {}

  async syncUser(dto: SyncUserDto): Promise<User> {
    let user = await this.em.findOne(User, { id: dto.id });

    if (!user) {
      this.logger.log(`Creating new user: ${dto.email} (${dto.id})`);
      user = this.em.create(User, {
        id: dto.id,
        email: dto.email,
        fullName: dto.fullName,
        avatarUrl: dto.avatarUrl,
        provider: dto.provider || 'email',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.em.persistAndFlush(user);
    } else {
      // Update existing user if details changed
      let changed = false;
      if (dto.fullName && user.fullName !== dto.fullName) {
        user.fullName = dto.fullName;
        changed = true;
      }
      if (dto.avatarUrl && user.avatarUrl !== dto.avatarUrl) {
        user.avatarUrl = dto.avatarUrl;
        changed = true;
      }
      // Don't overwrite provider usually, but maybe we want to track last used?
      
      if (changed) {
        this.logger.log(`Updating user: ${dto.email}`);
        user.updatedAt = new Date();
        await this.em.flush();
      }
    }

    return user;
  }

  async findOne(id: string): Promise<User | null> {
    return this.em.findOne(User, { id });
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ data: User[], total: number, page: number, totalPages: number }> {
    const offset = (page - 1) * limit;
    
    const [data, total] = await this.em.findAndCount(
      User,
      {},
      {
        limit,
        offset,
        orderBy: { createdAt: 'DESC' },
      }
    );

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
