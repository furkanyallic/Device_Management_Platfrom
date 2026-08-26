import { Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TelemetryService } from './telemetry.service';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @MessagePattern('iot.telemetry.raw') //Kafka ile mesajı consume ettiğimiz yer.
  async handleTelemetryStream(@Payload() message: any) {
    try {
      const telemetryData = message;
      await this.telemetryService.saveTelemetry(telemetryData);
      console.log(`Telemetry kaydedildi , device:${telemetryData.deviceId}`);
    } catch (err) {
      console.error('Telemetry kaydetme hatası', err);
    }
  }

  @Get('device/:deviceId/latest')
  async getLatestByDevice(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit: string = '20',
  ) {
    return await this.telemetryService.getLatestByDeviceId(
      deviceId,
      parseInt(limit, 10),
    );
  }

  // Örn: GET /telemetry/device/:deviceId/history?start=...&end=...
  @Get('device/:deviceId/history')
  async getHistoryByDevice(
    @Param('deviceId') deviceId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return await this.telemetryService.getHistoryByDeviceId(
      deviceId,
      start ? new Date(start) : new Date(Date.now() - 24 * 60 * 60 * 1000), // Son 24 saat fallback
      end ? new Date(end) : new Date(),
    );
  }
}
