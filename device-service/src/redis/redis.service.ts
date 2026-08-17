import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

    this.client.on('connect', () =>
      this.logger.log('Redis bağlantısı başarılı(device-service)'),
    );
    this.client.on('error', (err) => this.logger.log('Redis hatası', err));
  }

  //yeni cihaz ekleme
  async addDevice(deviceId: string) {
    await this.client.sadd('active_devices', deviceId);
    await this.client.publish('device.created', deviceId);
    this.logger.log(`Yeni cihaz redis' kaydedildi${deviceId}`);
  }

  async removeDevice(deviceId: string) {
    await this.client.srem('active_devices', deviceId);
    await this.client.publish('device.deleted', deviceId);
    this.logger.log(`cihaz redis'ten  kladırıldı ${deviceId}`);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
