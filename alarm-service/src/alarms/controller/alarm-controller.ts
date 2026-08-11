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
import { AlarmService } from '../services/alarm.service';
import { CreateAlarmDto } from '../dto/create-alarm.dto';
import { UpdateAlarmStatusDto } from '../dto/update-alarm-status.dto';
import { AlarmStatus } from '../../common/enums/alarm-status.enum';

@Controller('alarms')
export class AlarmController {
  constructor(private readonly alarmService: AlarmService) {}

  @Post()
  create(@Body() createDto: CreateAlarmDto) {
    return this.alarmService.create(createDto);
  }

  @Get()
  findAll(@Query('status') status?: AlarmStaatus) {
    if (status) {
      return this.alarmService.findByStatus(status);
    }
    return this.alarmService.findAll();
  }

  @Get('device/:deviceId'){
    findByDeviceId(@Param('deviceId') deviceId:string)
  }
}
