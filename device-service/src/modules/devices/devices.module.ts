import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from './entitites/device.entity';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceEntity])],
  providers: [DevicesService, RedisService],
  controllers: [DevicesController],
})
export class DevicesModule {}
