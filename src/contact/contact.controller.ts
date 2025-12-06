import { Body, Controller, Get, Ip, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { ReplyContactDto } from './dto/reply-contact.dto';
import { ContactService } from './contact.service';
import { AdminGuard } from '../admin/admin.guard';
import { ContactMessage } from './contact-message.entity';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async submit(@Body() dto: CreateContactDto, @Req() req: any, @Ip() ip: string): Promise<{ id: string }> {
    // Note: In a real app, you might want to extract userId from a JWT if authenticated
    // For now, we'll assume it's public or userId is extracted if available
    const userId: string | undefined = req?.user?.id;
    
    return this.contactService.submitContact({
      dto,
      userId,
      userAgent: req?.headers?.['user-agent'],
      ip,
    });
  }

  @Get()
  @UseGuards(AdminGuard)
  async findAll(): Promise<ContactMessage[]> {
    return this.contactService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  async findOne(@Param('id') id: string): Promise<ContactMessage> {
    return this.contactService.findOne(id);
  }

  @Post(':id/reply')
  @UseGuards(AdminGuard)
  async reply(@Param('id') id: string, @Body() dto: ReplyContactDto): Promise<ContactMessage> {
    return this.contactService.reply(id, dto);
  }
}
