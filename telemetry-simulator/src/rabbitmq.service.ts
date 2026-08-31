import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;
  private readonly exchangeName = 'telemetry_exchange';

  async onModuleInit() {
    await this.initRabbitMQ();
  }

  private async initRabbitMQ() {
    const rabbitMqUrl =
      process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    try {
      this.connection = await amqp.connect(rabbitMqUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true,
      });
      this.logger.log('RabbitMQ bağlantısı ve Exchange kuruldu.');
    } catch (error) {
      this.logger.error('RabbitMq bağlantı hatası, 5 sn sonra tekrar denenecek...', error);
      setTimeout(() => this.initRabbitMQ(), 5000);
    }
  }

  async sendTelemetry(routingKey: string, payload: any) {
    if (!this.channel) {
      this.logger.warn('RabbitMQ kanalı henüz hazır değil! Bağlantı tekrar deneniyor...');
      this.initRabbitMQ();
      return;
    }
    try {
      const messageBuffer = Buffer.from(JSON.stringify(payload));
      this.channel.publish(this.exchangeName, routingKey, messageBuffer);
      this.logger.debug(
        `rabbitMQ veri gönderildi (${routingKey}):${payload.deviceId}`,
      );
    } catch (error) {
      this.logger.error('RabbitMQ veri gönderme hatası:', error);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
