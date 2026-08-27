import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { RabbitMQConsumerService } from './services/rabbitmq-consumer.servise';
import { NotificationService } from './services/notification.service';
import { EmailService } from './services/email.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationController],
  providers: [NotificationService, EmailService, RabbitMQConsumerService],
  exports: [NotificationService],
})
export class NotificationModule {}
