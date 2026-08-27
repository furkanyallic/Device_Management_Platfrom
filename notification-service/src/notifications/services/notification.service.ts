import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationStatus } from '../enums/notification-status.enum';
import { InjectRepository } from '@nestjs/typeorm';

export type AlarmEventType = 'TRIGGERED' | 'RESOLVED';

export interface SendAlarmEmailPayload {
  alarmId: string;
  deviceId: string;
  deviceName: string;
  ruleName?: string;
  severity: string;
  triggerValue: number;
  threshold: number;
  metricType?: string;
  eventType?: AlarmEventType; // <-- 'TRIGGERED' | 'RESOLVED'
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
    const isResolved = payload.eventType === 'RESOLVED';

    // 1. Dinamik Başlık (Subject)
    const subject = isResolved
      ? `[RESOLVED] IoT Alarmı Düzeldi: ${payload.deviceName}`
      : `[${payload.severity}] IoT Alarmı: ${payload.deviceName}`;

    // 2. Dinamik Düz Metin (Fallback)
    const content = isResolved
      ? `
      IoT Alarmı Çözüldü / Değer Normale Döndü
      ----------------------------------------
      Cihaz           : ${payload.deviceName}
      Cihaz ID        : ${payload.deviceId}
      Kural           : ${payload.ruleName || 'Eşik Aşımı'}
      Güncel Değer    : ${payload.triggerValue}
      Eşik Değeri     : ${payload.threshold}
      Zaman           : ${new Date().toLocaleString('tr-TR')}
      ----------------------------------------
      `.trim()
      : `
      Bir alarm tetiklendi!
      ----------------------------------------
      Alarm ID        : ${payload.alarmId}
      Cihaz           : ${payload.deviceName}
      Cihaz ID        : ${payload.deviceId}
      Alarm Şiddeti   : ${payload.severity}
      Tetiklenen Değer: ${payload.triggerValue}
      Eşik Değeri     : ${payload.threshold}
      Zaman           : ${new Date().toLocaleString('tr-TR')}
      ----------------------------------------
      `.trim();

    // 3. Rozet ve Kart Stilleri (Resolved ise Yeşil, Triggered ise Koyu Gri/Nötr)
    const headerTitle = isResolved
      ? 'IoT Alarm Normal Değerine Döndü'
      : 'IoT Sistem Uyarısı';
    const badgeText = isResolved ? '✅ NORMAL' : payload.severity || 'WARNING';
    const badgeBg = isResolved ? '#dcfce7' : '#f1f5f9';
    const badgeColor = isResolved ? '#15803d' : '#475569';
    const valueColor = isResolved ? '#16a34a' : '#0f172a';
    const valueLabel = isResolved ? 'Güncel Değer' : 'Ölçülen Değer';

    // 4. HTML Şablonu (margin: 0; ile sola yaslı)
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1e293b; text-align: left;">
        <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #0f172a;">${headerTitle}</h3>
          <span style="display: inline-block; margin-top: 6px; padding: 3px 8px; font-size: 11px; font-weight: 600; text-transform: uppercase; background-color: ${badgeBg}; color: ${badgeColor}; border-radius: 4px;">
            ${badgeText}
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 35%;">Cihaz</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${payload.deviceName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Kural</td>
            <td style="padding: 6px 0; color: #0f172a;">${payload.ruleName || 'Eşik Aşımı'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">${valueLabel}</td>
            <td style="padding: 6px 0; font-weight: 600; color: ${valueColor};">${payload.triggerValue}</td>
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

    // 5. Gönderim
    const isSent = await this.emailService.sendEmail(
      recipientEmail,
      subject,
      content,
      htmlContent,
    );

    // 6. DB Kaydı
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

    this.logger.log(
      `Bildirim kaydı oluşturuldu: ${savedNotification.id} (${payload.eventType || 'TRIGGERED'})`,
    );

    return savedNotification;
  }

  async findAll(limit: number = 20): Promise<NotificationEntity[]> {
    return await this.notificationRepository.find({
      order: { sent_at: 'DESC' },
      take: limit,
    });
  }
}
