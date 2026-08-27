export type NotificationStatus = 'SENT' | 'FAILED';

export interface Notification {
  id: string;
  recipient_email: string;
  subject: string;
  content: string;
  status: NotificationStatus;
  alarm_id: string | null;
  device_id: string | null;
  sent_at: string;
}
