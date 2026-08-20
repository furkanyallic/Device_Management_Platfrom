import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import {
  NotificationService,
  SendAlarmEmailPayload,
} from './notification.service';

@Injectable()
export class RabbitMQConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConsumerService.name);
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;
  constructor(private readonly notificationService: NotificationService) {}

  async onModuleInit() {
    await this.connectAndConsume();
  }

  private async connectAndConsume() {
    const rabbitMqUrl =
      process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    const queueName = process.env.RABBITMQ_QUEUE || 'alarm.notifications';

    try {
      this.connection = await amqp.connect(rabbitMqUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(queueName, { durable: true });

      this.logger.log(
        `Rabbitmq bağlantısı başarılı.Dinlenen kuyruk ${queueName} `,
      );

      //mesaj dinleme kısmı
      await this.channel.consume(queueName, async (msg) => {
        if (msg !== null) {
          try {
            const content = msg.content.toString();
            const payload: SendAlarmEmailPayload = JSON.parse(content);

            this.logger.log(
              `Yeni alarm bildirimi mesajı alındı Alarm Id :${payload.alarmId}`,
            );
            //Bildirim servisini tetikliyoruz
            await this.notificationService.sendAlarmNotification(payload);

            //Başarıyla işlendğini onaylıyoruz (ack),mesaj kuruktan silinir
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error('Mesaj işlenirken hata oluştu', error);

            this.channel.nack(msg, false, false);
          }
        }
      });
    } catch (error) {
      this.logger.error('Rabbitmq bağlantı hatası', error);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
