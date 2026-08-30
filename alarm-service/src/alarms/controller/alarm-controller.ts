import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AlarmService } from '../services/alarm-service';
import { CreateAlarmDto } from '../dto/create-alarm.dto';
import { UpdateAlarmStatusDto } from '../dto/update-alarm-status.dto';
import { AlarmStatus } from 'src/common/enums/alarm-status';

@Controller('alarms')
export class AlarmController {
  constructor(private readonly alarmService: AlarmService) {}

  @Post()
  create(@Body() createDto: CreateAlarmDto) {
    return this.alarmService.create(createDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: AlarmStatus,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.max(1, parseInt(limit, 10)) : 20;
    return this.alarmService.findAllPaginated(pageNum, limitNum, status);
  }

  @Get('device/:deviceId')
  findByDeviceId(@Param('deviceId') deviceId: string) {
    return this.alarmService.findByDeviceid(deviceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alarmService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAlarmStatusDto,
  ) {
    return this.alarmService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.alarmService.delete(id);
  }
}
