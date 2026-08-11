import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AlarmSeverity } from 'src/common/enums/alarm-severity';

@Entity('alarm-rules')
export class AlarmRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  deviceId: string;

  @Column({ type: 'varchar', length: 50 })
  metricName: string; // Örn: 'temperature', 'humidity'

  @Column({ type: 'varchar', length: 10 })
  operator: string; // Örn: '>', '>=', '<', '<=', '=='

  @Column({ type: 'float' })
  threshold: number; // Örn: 75.0

  @Column({ type: 'enum', enum: AlarmSeverity, default: AlarmSeverity.WARNING })
  severity: AlarmSeverity;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
