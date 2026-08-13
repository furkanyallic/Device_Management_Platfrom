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
  findAll(@Query('status') status?: AlarmStatus) {
    if (status) {
      return this.alarmService.findByStatus(status);
    }
    return this.alarmService.findAll();
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
