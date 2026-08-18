import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { NotificationStatus } from '../enums/notification-status.enum';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recipient_email' })
  recipient_email: string; //bildirimin gönderildği e posta adresi

  @Column({ name: 'subject' })
  subject: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.SENT,
  })
  status: NotificationStatus;

  @Column({ name: 'alarm_id', type: 'uuid', nullable: true })
  alarm_id: string;

  @Column({ name: 'device_id', type: 'uuid', nullable: true })
  device_id: string;

  @CreateDateColumn({ name: 'sent_at' })
  sent_at: Date;
}
