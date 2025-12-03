import { Injectable } from '@nestjs/common'

export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
  replyTo?: string
}

@Injectable()
export class EmailService {
  private readonly emailEnabled = process.env.EMAIL_ENABLED === 'true'
  private readonly fromEmail = process.env.EMAIL_FROM || 'noreply@eazycertify.com'
  
  /**
   * Send an email notification
   * In production, this should integrate with a real email service like SendGrid, AWS SES, etc.
   * For now, it logs the email content to console
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.emailEnabled) {
      console.log('[Email] Email notifications are disabled')
      return
    }

    // Log email for development (replace with actual email service in production)
    console.log('[Email] Sending email:', {
      from: this.fromEmail,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    // TODO: Implement actual email sending logic here
    // Example with nodemailer:
    // const transporter = nodemailer.createTransporter({ ... })
    // await transporter.sendMail({ from: this.fromEmail, ...options })
  }

  /**
   * Send account unlock notification to user
   */
  async sendAccountUnlockedEmail(userEmail: string, examCode: string, examTitle: string): Promise<void> {
    const subject = `Your ${examCode} Course Access Has Been Restored`
    
    const text = `
Hello,

Good news! Your access to the ${examCode} - ${examTitle} course has been restored.

You can now access your course materials from your registered device.

If you have any questions or concerns, please contact our support team.

Best regards,
EazyCertify Team
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Course Access Restored</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Good news! Your access to the <strong>${examCode} - ${examTitle}</strong> course has been restored.</p>
      <p>You can now access your course materials from your registered device.</p>
      <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Access Course</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} EazyCertify. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim()

    await this.sendEmail({
      to: userEmail,
      subject,
      text,
      html,
    })
  }

  /**
   * Send account locked notification to user
   */
  async sendAccountLockedEmail(userEmail: string, examCode: string, examTitle: string): Promise<void> {
    const subject = `Important: Your ${examCode} Course Access Has Been Locked`
    
    const text = `
Hello,

Your access to the ${examCode} - ${examTitle} course has been locked due to an access attempt from a different device.

Our system detected that you tried to access the course from a device that is different from your originally registered device. For security reasons, we have locked your account.

If you believe this is an error or if you need to change your registered device, please contact our support team at support@eazycertify.com.

Best regards,
EazyCertify Team
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #fef2f2; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #fecaca; }
    .warning { background-color: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">⚠️ Account Access Locked</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <div class="warning">
        <strong>Important Security Notice</strong><br/>
        Your access to the <strong>${examCode} - ${examTitle}</strong> course has been locked.
      </div>
      <p>Our system detected that you tried to access the course from a device that is different from your originally registered device. For security reasons, we have locked your account.</p>
      <p>If you believe this is an error or if you need to change your registered device, please contact our support team at <a href="mailto:support@eazycertify.com">support@eazycertify.com</a>.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} EazyCertify. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim()

    await this.sendEmail({
      to: userEmail,
      subject,
      text,
      html,
    })
  }
}
