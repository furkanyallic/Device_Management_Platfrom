import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SimulatorService } from './simulator.service';
import { KafkaService } from './kafka.service';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import { SimulatorRedisService } from './redis/simulator-redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [
    KafkaService,
    SimulatorService,
    RabbitMQService,
    SimulatorRedisService,
  ],
})
export class AppModule {}
