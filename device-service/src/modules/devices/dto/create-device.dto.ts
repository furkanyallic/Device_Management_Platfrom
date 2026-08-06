import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { DeviceProtocol } from '../../../common/enums/protocol.enum';
import { DeviceStatus } from '../../../common/enums/device-status.enum';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  serialNumber!: string;

  @IsEnum(DeviceProtocol)
  protocol!: DeviceProtocol;

  @IsEnum(DeviceStatus)
  status?: DeviceStatus;
}