import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(
    to: string,
    subject: string,
    content: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`Eposta gönderiliyor ${to}`);
      this.logger.log(`Konu ${subject}`);
      this.logger.debug(`İçerik ${content}`);

      return true;
    } catch (error) {
      this.logger.error(`${to} kişisine Eposta gönderimi başarısız `, error);
      return false;
    }
  }
}
