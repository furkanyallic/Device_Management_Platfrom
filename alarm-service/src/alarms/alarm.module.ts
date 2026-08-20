import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmRuleEntity } from './entities/alarm-rule.entity';
import { AlarmEntity } from './entities/alarm.entity';
import { AlarmRuleService } from './services/alarm-rule.service';
import { AlarmRuleController } from './controller/alarm-rule.controller';
import { AlarmController } from './controller/alarm-controller';
import { AlarmService } from './services/alarm-service';
import { TelemetryConsumerService } from './services/telemetry-consumer.service';
import { NotificationProducerService } from './services/notification-producer.service';

@Module({
  imports: [TypeOrmModule.forFeature([AlarmEntity, AlarmRuleEntity])],
  controllers: [AlarmRuleController, AlarmController],
  providers: [
    AlarmRuleService,
    AlarmService,
    TelemetryConsumerService,
    NotificationProducerService,
  ],
  exports: [AlarmRuleService, AlarmService, NotificationProducerService],
})
export class AlarmModule {}
