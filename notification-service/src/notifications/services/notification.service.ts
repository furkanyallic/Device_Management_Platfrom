import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationStatus } from '../enums/notification-status.enum';
import { InjectRepository } from '@nestjs/typeorm';

export interface SendAlarmEmailPayload {
  alarmId: string;
  deviceId: string;
  deviceName: string;
  ruleName?: string;
  severity: string;
  triggerValue: number;
  threshold: number;
  metricType?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly emailService: EmailService,
  ) {}

  async sendAlarmNotification(
    payload: SendAlarmEmailPayload,
  ): Promise<NotificationEntity> {
    const recipientEmail = process.env.ADMIN_EMAIL || 'admin18@gmail.com';
    const subject = `[${payload.severity}] IoT Alarmı: ${payload.deviceName}`;

    const content = `
    Bir alarm tetiklendi,alarmId: ${payload.alarmId},
    Cihaz id'si :${payload.deviceId},
    Alarm şiddeti:${payload.severity},
    Eşik değeri:${payload.threshold},
    Zaman:${new Date().toLocaleString()}`.trim();

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1e293b;">
        <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #0f172a;">IoT Sistem Uyarısı</h3>
          <span style="display: inline-block; margin-top: 6px; padding: 2px 8px; font-size: 11px; font-weight: 600; text-transform: uppercase; background-color: #f1f5f9; color: #475569; border-radius: 4px;">
            ${payload.severity || 'WARNING'}
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 40%;">Cihaz</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${payload.deviceName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Kural</td>
            <td style="padding: 6px 0; color: #0f172a;">${payload.ruleName || 'Eşik Aşımı'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Ölçülen Değer</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${payload.triggerValue}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Eşik Değeri</td>
            <td style="padding: 6px 0; color: #0f172a;">${payload.threshold}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; line-height: 1.5;">
          <div>Tarih: ${new Date().toLocaleString('tr-TR')}</div>
          <div>Cihaz ID: ${payload.deviceId}</div>
        </div>
      </div>
    `.trim();

    const isSent = await this.emailService.sendEmail(
      recipientEmail,
      subject,
      content,
      htmlContent,
    );

    const notification = this.notificationRepository.create({
      recipient_email: recipientEmail,
      subject,
      content,
      status: isSent ? NotificationStatus.SENT : NotificationStatus.FAILED,
      alarm_id: payload.alarmId,
      device_id: payload.deviceId,
    });

    const savedNotification =
      await this.notificationRepository.save(notification);

    this.logger.log(`Bildirim kaydı oluşturuldu ${savedNotification.id}`);

    return savedNotification;
  }

  async findAll(): Promise<NotificationEntity[]> {
    return await this.notificationRepository.find({
      order: { sent_at: 'DESC' },
    });
  }
}
