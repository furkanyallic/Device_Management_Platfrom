import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class SimulatorRedisService implements OnModuleDestroy {
  private readonly logger = new Logger(SimulatorRedisService.name);

  // onModuleInit beklemeden doğrudan oluşturuyoruz (undefined kalma şansı sıfır)
  private readonly client: Redis;
  private readonly subscriber: Redis;

  constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    };

    this.client = new Redis(redisConfig);
    this.subscriber = new Redis(redisConfig);
    this.logger.log(
      'Redis istemcileri constructor içinde başarıyla başlatıldı.',
    );
  }

  // Var olan kayıtları getir
  async getActiveDevices(): Promise<string[]> {
    return await this.client.smembers('active_devices');
  }

  subscribeToDeviceEvents(
    onDeviceCreated: (deviceId: string) => void,
    onDeviceDeleted: (deviceId: string) => void,
  ) {
    this.subscriber.subscribe('device.created', 'device.deleted', (err) => {
      if (err) this.logger.error('Pub/Sub abonelik hatası', err);
      else this.logger.log('Redis pub/sub (device.created/deleted) dinleniyor');
    });

    this.subscriber.on('message', (channel, deviceId) => {
      if (channel === 'device.created') {
        this.logger.log(
          `Yeni cihaz algılandı, simülasyona ekleniyor: ${deviceId}`,
        );
        onDeviceCreated(deviceId);
      } else if (channel === 'device.deleted') {
        this.logger.log(
          `Cihaz silindi, simülasyondan çıkarılıyor: ${deviceId}`,
        );
        onDeviceDeleted(deviceId);
      }
    });
  }

  onModuleDestroy() {
    this.client?.disconnect();
    this.subscriber?.disconnect();
  }
}
