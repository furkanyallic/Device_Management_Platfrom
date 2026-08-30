import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AlarmSeverity } from 'src/common/enums/alarm-severity';
import { AlarmStatus } from 'src/common/enums/alarm-status';

export class CreateAlarmDto {
  @IsUUID()
  @IsNotEmpty()
  deviceId: string;

  @IsUUID()
  @IsNotEmpty({
    message: 'ruleId alanı zorunludur. Lütfen geçerli bir kural seçin.',
  })
  ruleId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsEnum(AlarmSeverity)
  @IsNotEmpty()
  severity: AlarmSeverity;

  @IsEnum(AlarmStatus)
  @IsOptional()
  status?: AlarmStatus;

  @IsNumber()
  @IsOptional()
  triggerValue?: number;
}
