import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AlarmSeverity } from 'src/common/enums/alarm-severity';
import { AlarmStatus } from 'src/common/enums/alarm-status';

@Entity('alarms')
export class AlarmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  deviceId: string;

  @Column({ type: 'uuid', nullable: true })
  ruleId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: AlarmSeverity })
  severity: AlarmSeverity;

  @Column({ type: 'enum', enum: AlarmStatus, default: AlarmStatus.OPEN })
  status: AlarmStatus;

  @Column({ type: 'float', nullable: true })
  triggerValue: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
