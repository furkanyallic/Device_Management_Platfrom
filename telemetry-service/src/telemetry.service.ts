import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
