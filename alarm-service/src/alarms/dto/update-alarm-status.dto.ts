import { IsEnum, IsNotEmpty } from 'class-validator';
import { AlarmStatus } from '../../common/enums/alarm-status';

export class UpdateAlarmStatusDto {
  @IsEnum(AlarmStatus)
  @IsNotEmpty()
  status: AlarmStatus;
}
