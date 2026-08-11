import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmRuleEntity } from './entities/alarm-rule.entity';
import { AlarmEntity } from './entities/alarm.entity';
import { AlarmRuleService } from './services/alarm-rule.service';
import { AlarmRuleController } from './controller/alarm-rule.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlarmEntity, AlarmRuleEntity])],
  controllers: [AlarmRuleController],
  providers: [AlarmRuleService],
  exports: [AlarmRuleService],
})
export class AlarmModule {}
