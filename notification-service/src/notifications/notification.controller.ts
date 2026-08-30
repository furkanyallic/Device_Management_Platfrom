import {
  Get,
  Query,
  Controller,
} from '@nestjs/common';
import { NotificationService } from './services/notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getAllNotifications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.max(1, parseInt(limit, 10)) : 20;
    return await this.notificationService.findAllPaginated(pageNum, limitNum);
  }
}
