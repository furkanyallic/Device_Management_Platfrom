import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
//import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  async sendEmail(
    to: string,
    subject: string,
    content: string,
    htmlContent: string,
  ): Promise<boolean> {
    try {
      // this.logger.log(`Eposta gönderiliyor ${to}`);
      // this.logger.log(`Konu ${subject}`);
      // this.logger.debug(`İçerik${content}`);

      const from = process.env.SMTP_FROM || process.env.SMTP_USER;
      //sendMail , nodemailer kütüphanesinin smtp sunucusuna istek atan fonksiyonu
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text: content,
        html: htmlContent || `<pre>${content}</pre>`,
      });
      this.logger.log(
        ` E-posta başarıyla gönderildi , Gönderilen: ${to} | Mesaj ID: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`${to} kişisine Eposta gönderimi başarısız `, error);
      return false;
    }
  }
}
