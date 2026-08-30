export type DeviceProtocol = 'MQTT' | 'MODBUS_TCP' | 'HTTP';
export type DeviceStatus = 'ACTIVE' | 'INACTIVE' | 'OFFLINE';

export interface Device {
  id: string;
  name: string;
  serialNumber: string;
  protocol: DeviceProtocol;
  status: DeviceStatus;
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
  deleted_at: string | null;
}

export interface CreateDeviceDto {
  name: string;
  serialNumber: string;
  protocol: DeviceProtocol;
  status?: DeviceStatus;
}

export interface UpdateDeviceDto {
  name?: string;
  serialNumber?: string;
  protocol?: DeviceProtocol;
  status?: DeviceStatus;
}
