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
      this.logger.log('Redis bağlantısı başarılı (device-service)'),
    );
    this.client.on('error', (err) => this.logger.error('Redis hatası', err));
  }

  // Yeni cihaz ekleme (ID + Name ile)
  async addDevice(deviceId: string, deviceName: string) {
    const payload = JSON.stringify({ id: deviceId, name: deviceName });

    // 1. Set'e JSON olarak ekle
    await this.client.sadd('active_devices', payload);
    // 2. Pub/Sub kanalına JSON yayınla
    await this.client.publish('device.created', payload);

    this.logger.log(
      `Yeni cihaz Redis'e kaydedildi: ${deviceName} (${deviceId})`,
    );
  }

  // Cihaz silme
  async removeDevice(deviceId: string) {
    // Set içindeki JSON elemanları arasından bu ID'ye sahip olanı bulup sil
    const members = await this.client.smembers('active_devices');
    for (const member of members) {
      try {
        const parsed = JSON.parse(member);
        if (parsed.id === deviceId || member === deviceId) {
          await this.client.srem('active_devices', member);
        }
      } catch {
        if (member === deviceId) {
          await this.client.srem('active_devices', member);
        }
      }
    }

    // Pub/Sub kanalına silme olayını bildir
    await this.client.publish('device.deleted', deviceId);
    this.logger.log(`Cihaz Redis'ten kaldırıldı: ${deviceId}`);
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }
}
