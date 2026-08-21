import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

export interface DeviceInfo {
  id: string;
  name: string;
}

@Injectable()
export class SimulatorRedisService implements OnModuleDestroy {
  private readonly logger = new Logger(SimulatorRedisService.name);

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

  // 1. Var olan kayıtları JSON parse ederek DeviceInfo[] olarak getir
  async getActiveDevices(): Promise<DeviceInfo[]> {
    const members = await this.client.smembers('active_devices');
    return members
      .map((item) => {
        try {
          return JSON.parse(item) as DeviceInfo;
        } catch {
          // Geriye dönük uyumluluk (eski veriler düz id string ise)
          return { id: item, name: 'Bilinmeyen Cihaz' };
        }
      })
      .filter((device) => Boolean(device.id));
  }

  // 2. Pub/Sub mesajlarını JSON parse ederek yakala
  subscribeToDeviceEvents(
    onDeviceCreated: (device: DeviceInfo) => void,
    onDeviceDeleted: (deviceId: string) => void,
  ) {
    this.subscriber.subscribe('device.created', 'device.deleted', (err) => {
      if (err) this.logger.error('Pub/Sub abonelik hatası', err);
      else this.logger.log('Redis pub/sub (device.created/deleted) dinleniyor');
    });

    this.subscriber.on('message', (channel, message) => {
      if (channel === 'device.created') {
        try {
          // message içeriği: JSON.stringify({ id, name })
          const device: DeviceInfo =
            typeof message === 'string' && message.startsWith('{')
              ? JSON.parse(message)
              : { id: message, name: 'Bilinmeyen Cihaz' };

          this.logger.log(
            `Yeni cihaz algılandı: ${device.name} (${device.id})`,
          );
          onDeviceCreated(device);
        } catch (err) {
          this.logger.error('device.created JSON parse hatası', err);
        }
      } else if (channel === 'device.deleted') {
        // Silinirken sadece ID gelmesi yeterli
        let deviceId = message;
        try {
          if (message.startsWith('{')) {
            const parsed = JSON.parse(message);
            deviceId = parsed.id;
          }
        } catch {}

        this.logger.log(`Cihaz silindi: ${deviceId}`);
        onDeviceDeleted(deviceId);
      }
    });
  }

  onModuleDestroy() {
    this.client?.disconnect();
    this.subscriber?.disconnect();
  }
}
