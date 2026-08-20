import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationStatus } from '../enums/notification-status.enum';
import { InjectRepository } from '@nestjs/typeorm';

export interface SendAlarmEmailPayload {
  alarmId: string;
  deviceId: string;
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
    const subject = `[ ${payload.severity}] iot cihaz alarmı ,cihaz: ${payload.deviceId}`;

    const content = `
    Bir alarm tetiklendi: ${payload.alarmId},
    Cihaz id'si :${payload.deviceId},
    Alarm şiddeti:${payload.severity},
    Eşik değeri:${payload.threshold},
    Zaman:${new Date().toLocaleString()}`.trim();

    const isSent = await this.emailService.sendEmail(
      recipientEmail,
      subject,
      content,
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
