export type AlarmSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlarmStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Alarm {
  id: string;
  deviceId: string;
  ruleId: string | null;
  title: string;
  description: string | null;
  severity: AlarmSeverity;
  status: AlarmStatus;
  triggerValue: number | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface CreateAlarmDto {
  deviceId: string;
  ruleId?: string;
  title: string;
  description?: string;
  severity: AlarmSeverity;
  status?: AlarmStatus;
  triggerValue?: number;
}

export interface UpdateAlarmStatusDto {
  status: AlarmStatus;
}

export interface AlarmRule {
  id: string;
  deviceId: string;
  metricName: string;
  operator: string;
  threshold: number;
  severity: AlarmSeverity;
  isActive: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface CreateAlarmRuleDto {
  deviceId: string;
  metricName: string;
  operator: string;
  threshold: number;
  severity?: AlarmSeverity;
  isActive?: boolean;
}

export interface UpdateAlarmRuleDto {
  deviceId?: string;
  metricName?: string;
  operator?: string;
  threshold?: number;
  severity?: AlarmSeverity;
  isActive?: boolean;
}
