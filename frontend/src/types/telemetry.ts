export interface TelemetryRecord {
  id: string;
  deviceId: string;
  metrics: Record<string, number>;
  timestamp: string;
  createdAt: string;
}
