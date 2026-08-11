import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AlarmRuleService } from '../services/alarm-rule.service';
import { CreateAlarmRuleDto } from '../dto/create-alarm-rule.dto';
import { UpdateAlarmRuleDto } from '../dto/update-alarm-rule.dto';

@Controller('alarm-rules')
export class AlarmRuleController {
  constructor(private readonly alarmRuleService: AlarmRuleService) {}

  @Post()
  create(@Body() createDto: CreateAlarmRuleDto) {
    return this.alarmRuleService.create(createDto);
  }

  @Get()
  findAll() {
    return this.alarmRuleService.findAll();
  }

  @Get('device/:deviceId')
  findBydeviceId(@Param('deviceId') deviceId: string) {
    return this.alarmRuleService.findByDeviceId(deviceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alarmRuleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAlarmRuleDto) {
    return this.alarmRuleService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alarmRuleService.remove(id);
  }
}
