import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AlarmSeverity } from 'src/common/enums/alarm-severity';

export class CreateAlarmRuleDto {
  @IsUUID()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  metricName: string; // Örn voltage, temperature

  @IsString()
  @IsNotEmpty()
  operator: string;

  @IsNumber()
  @IsNotEmpty()
  threshold: number;

  @IsEnum(AlarmSeverity)
  @IsOptional()
  severity?: AlarmSeverity;

  @IsBoolean()
  @IsOptional()
  isactive?: boolean;
}
