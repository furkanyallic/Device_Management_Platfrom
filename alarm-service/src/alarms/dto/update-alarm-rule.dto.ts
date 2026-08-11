import { PartialType } from '@nestjs/mapped-types';
import { CreateAlarmRuleDto } from './create-alarm-rule.dto';

export class UpdateAlarmRuleDto extends PartialType(CreateAlarmRuleDto) {}
