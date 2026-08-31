import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import * as amqp from 'amqplib';

export type AlarmEventType = 'TRIGGERED' | 'RESOLVED';
export interface AlarmNotificationPayload {
  alarmId: string;
  deviceId: string;
  deviceName: string;
  ruleName?: string;
  severity: string;
  triggerValue: number;
  threshold: number;
  eventType: AlarmEventType;
}

@Injectable()
export class NotificationProducerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(NotificationProducerService.name);
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;
  private readonly queueName =
    process.env.NOTIFICATION_QUEUE || 'alarm.notifications';

  async onModuleInit() {
    await this.initRabbitMQ();
  }

  private async initRabbitMQ() {
    const rabbitMqUrl =
      process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    try {
      this.connection = await amqp.connect(rabbitMqUrl);
      this.channel = await this.connection.createChannel();

      // Kuyruğu garantiye alıyoruz
      await this.channel.assertQueue(this.queueName, { durable: true });
      this.logger.log(
        ` RabbitMQ Bildirim Producer hazır. Hedef Kuyruk: [${this.queueName}]`,
      );
    } catch (error) {
      this.logger.error(' RabbitMQ Producer bağlantı hatası, 5 sn sonra tekrar denenecek:', error);
      setTimeout(() => this.initRabbitMQ(), 5000);
    }
  }

  async sendAlarmNotification(
    payload: AlarmNotificationPayload,
  ): Promise<void> {
    if (!this.channel) {
      this.logger.error('Rabbitmq kanalı açık değil, tekrar bağlanılıyor...');
      this.initRabbitMQ();
      return;
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(payload));
      this.channel.sendToQueue(this.queueName, messageBuffer, {
        persistent: true,
      });
      this.logger.log(
        `Alarm bildirimi kuyruğa basıldı  alarmId: (${payload.alarmId}`,
      );
    } catch (error) {
      this.logger.error('Kuyruğa mesaj gönderilirken hata oluştu', error);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
