import {
  Get,
  Query,
  Controller,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationService } from './services/notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getAllNotifications(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return await this.notificationService.findAll(limit);
  }
}
