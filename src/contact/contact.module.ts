import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactMessage } from './contact-message.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([ContactMessage]),
    EmailModule,
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
