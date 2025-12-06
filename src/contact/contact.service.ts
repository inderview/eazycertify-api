import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { EmailService } from '../email/email.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ReplyContactDto } from './dto/reply-contact.dto';
import { ContactMessage } from './contact-message.entity';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly email: EmailService,
  ) {}

  async submitContact(params: {
    dto: CreateContactDto;
    userId?: string;
    userAgent?: string;
    ip?: string;
  }): Promise<{ id: string }> {
    const { dto, userId, userAgent, ip } = params;

    const contactMessage = this.em.create(ContactMessage, {
      userId: userId ?? undefined,
      name: dto.name,
      email: dto.email,
      subject: dto.subject,
      reason: dto.reason,
      reasonOther: dto.reasonOther,
      message: dto.message,
      status: 'new',
      metadata: {
        user_agent: userAgent || null,
        ip: ip || null,
        page_url: dto.pageUrl || null,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      await this.em.persistAndFlush(contactMessage);
    } catch (error: any) {
      this.logger.error(`Failed to save contact message: ${error.message}`);
      throw new InternalServerErrorException('Failed to save your message. Please try again later.');
    }

    // Fire-and-forget email notifications
    void this.sendNotifications({ id: contactMessage.id, dto });

    return { id: contactMessage.id };
  }

  async findAll(): Promise<ContactMessage[]> {
    return this.em.find(ContactMessage, {}, { orderBy: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ContactMessage> {
    const message = await this.em.findOne(ContactMessage, { id });
    if (!message) {
      throw new NotFoundException(`Contact message with ID ${id} not found`);
    }
    return message;
  }

  async reply(id: string, dto: ReplyContactDto): Promise<ContactMessage> {
    const message = await this.findOne(id);

    // Save reply to database
    message.reply = dto.message;
    message.repliedAt = new Date();
    message.status = 'resolved';
    message.updatedAt = new Date();

    // Send email reply (using the HTML content as-is since it comes from rich text editor)
    try {
      await this.email.sendEmail({
        to: message.email,
        subject: `Re: ${message.subject}`,
        html: `
          <p>Dear ${this.escape(message.name)},</p>
          <div>${dto.message}</div>
          <br>
          <p>Best regards,</p>
          <p>The EazyCertify Team</p>
          <hr>
          <p><strong>Original Message:</strong></p>
          <p>${this.escape(message.message).replace(/\n/g, '<br>')}</p>
        `,
      });
    } catch (error: any) {
      this.logger.error(`Failed to send reply email: ${error.message}`);
      throw new InternalServerErrorException('Failed to send reply email');
    }

    await this.em.flush();

    return message;
  }

  private async sendNotifications(input: { id: string; dto: CreateContactDto }): Promise<void> {
    try {
      // In a real app, you might have a dedicated support email config
      const supportTo = process.env.SUPPORT_EMAIL || 'support@eazycertify.com';
      const subject = `[ContactUs:${input.dto.reason}] ${input.dto.subject}`;
      
      const html = `
        <div>
          <p><strong>From:</strong> ${this.escape(input.dto.name)} &lt;${this.escape(input.dto.email)}&gt;</p>
          <p><strong>Reason:</strong> ${this.escape(input.dto.reason)} ${input.dto.reason === 'other' && input.dto.reasonOther ? '(' + this.escape(input.dto.reasonOther) + ')' : ''}</p>
          <p><strong>Subject:</strong> ${this.escape(input.dto.subject)}</p>
          <p><strong>Message:</strong></p>
          <pre style="white-space:pre-wrap;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">${this.escape(input.dto.message)}</pre>
          <p style="color:#666;">Message ID: ${this.escape(input.id)}</p>
        </div>
      `;

      // Send to support
      await this.email.sendEmail({
        to: supportTo,
        subject,
        html,
        replyTo: input.dto.email,
      });

      // Optional acknowledgment to user
      const ackSubject = 'We received your message';
      const ackHtml = `
        <div>
          <p>Hi ${this.escape(input.dto.name)},</p>
          <p>Thanks for contacting us. Your message has been received. Our team will get back to you shortly.</p>
          <p><strong>Ticket:</strong> ${this.escape(input.id)}</p>
        </div>
      `;

      await this.email.sendEmail({
        to: input.dto.email,
        subject: ackSubject,
        html: ackHtml,
      });

    } catch (err: any) {
      this.logger.warn(`Failed to send contact emails: ${err?.message}`);
    }
  }

  private escape(s: string): string {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
