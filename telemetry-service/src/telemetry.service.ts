import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TelemetryRecordEntity } from './entities/telemetry-record.entity';
import { timestamp } from 'rxjs';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectRepository(TelemetryRecordEntity)
    private readonly telemetryRepository: Repository<TelemetryRecordEntity>,
  ) {}

  async saveTelemetry(payload: any): Promise<TelemetryRecordEntity> {
    const record = this.telemetryRepository.create({
      deviceId: payload.deviceId,
      metrics: payload.metrics,
      timestamp: new Date(payload.timestamp),
    });
    return await this.telemetryRepository.save(record);
  }

  async getLatestByDeviceId(
    deviceId: string,
    limit: number = 20,
  ): Promise<TelemetryRecordEntity[]> {
    const data = await this.telemetryRepository.find({
      where: { deviceId },
      order: { timestamp: 'DESC' },
      take: limit,
    });

    return data.reverse(); // Grafikte soldan sağa kronolojik akması için
  }

  // Belirli bir tarih aralığını getirir
  async getHistoryByDeviceId(
    deviceId: string,
    start: Date,
    end: Date,
  ): Promise<TelemetryRecordEntity[]> {
    return await this.telemetryRepository.find({
      where: {
        deviceId,
        timestamp: Between(start, end),
      },
      order: { timestamp: 'ASC' },
    });
  }
}
