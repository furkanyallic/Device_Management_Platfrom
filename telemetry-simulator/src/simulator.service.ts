import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { timestamp } from 'rxjs';
import { RabbitMQService } from './rabbitmq.service';
import { SimulatorRedisService } from './redis/simulator-redis.service';

@Injectable()
export class SimulatorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SimulatorService.name);
  private intervalId: NodeJS.Timeout;

  private activeDeviceIds: Set<string> = new Set();

  constructor(
    private readonly KafkaService: KafkaService,
    private readonly RabbitMQService: RabbitMQService,
    private readonly simulatorRedisService: SimulatorRedisService,
  ) {} //Kafka servis provider'ı bulunuyor hem de arkada nestJs Kafkaservice'in instance'ını oluşturuyor.

  async onModuleInit() {
    //Redisteki mevcut cihazları alıyoruz
    const existingDevices = await this.simulatorRedisService.getActiveDevices();
    existingDevices.forEach((id) => this.activeDeviceIds.add(id));
    this.logger.log(
      `Başlangıçta ${this.activeDeviceIds.size} adet cihaz redis'ten yüklendi`,
    );

    //yeni cihaz ekleme /silme olayları
    this.simulatorRedisService.subscribeToDeviceEvents(
      (newDeviceId) => this.activeDeviceIds.add(newDeviceId),
      (deletedDeviceId) => this.activeDeviceIds.delete(deletedDeviceId),
    );

    this.intervalId = setInterval(() => {
      this.generateAndSendTelemetry();
    }, 5000);
    console.log('Telemetry Simulator başlatıldı');
  }

  private async generateAndSendTelemetry() {
    const topic = 'iot.telemetry.raw';
    const routingKey = 'telemetry.data';
    for (const deviceId of this.activeDeviceIds) {
      const payload = {
        deviceId,
        timestamp: new Date().toISOString(),
        metrics: {
          temperature: parseFloat((20 + Math.random() * 70).toFixed(2)), // 20 - 90 °C
          humidity: parseFloat((30 + Math.random() * 50).toFixed(2)), // %30 - %80
          voltage: parseFloat((210 + Math.random() * 30).toFixed(2)), // 210 - 240 V
          current: parseFloat((1 + Math.random() * 15).toFixed(2)), // 1 - 16 A
          power: parseFloat((100 + Math.random() * 2000).toFixed(2)), // 100 - 2100 W
          frequency: 50,
          pressure: parseFloat((0.9 + Math.random() * 0.3).toFixed(2)),
          vibration: parseFloat((0.1 + Math.random() * 2.5).toFixed(2)),
          batteryLevel: Math.floor(20 + Math.random() * 80),
        },
      };
      try {
        await this.KafkaService.sendTelemetry(topic, deviceId, payload);

        await this.RabbitMQService.sendTelemetry(routingKey, payload);
        this.logger.log(`Telemetry gönderildi device : ${deviceId}`);
      } catch (error) {
        console.error(`Telemetry gönderim hatası ($deviceId)`, error);
      }
    }
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
