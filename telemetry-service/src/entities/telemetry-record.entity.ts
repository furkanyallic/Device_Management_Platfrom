    import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

// device_id ve timestamp üzerinde Composite Index tanımlıyoruz (Hızlı zaman aralığı sorguları için)
@Entity('telemetry_records')
@Index(['deviceId', 'timestamp'])
export class TelemetryRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  deviceId: string; //Device Service'teki cihaz ID'si
  
  @Column({ type: 'jsonb' })
  metrics: Record<string, number>; // 9 adet metrik(temperature,humidity.. gibi ) JSON formatında saklanır

  @Column({ type: 'timestamp' })
  timestamp: Date; // Ölçümün yapıldığı zaman

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date; // Veritabanına kayıt tarihi
}