import { Body, Controller, Ip, Post, Req } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactService } from './contact.service';

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
}
