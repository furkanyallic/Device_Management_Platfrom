import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { DeviceStatus } from '../../../common/enums/device-status.enum';
import { DeviceProtocol } from '../../../common/enums/protocol.enum';

@Entity('devices')
export class DeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  serialNumber: string;

  @Column({
    type: 'enum',
    enum: DeviceProtocol,
    default: DeviceProtocol.MQTT,
  })
  protocol: DeviceProtocol;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.ACTIVE,
  })
  status: DeviceStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft delete kuralı gereği deleted_at alanı
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}