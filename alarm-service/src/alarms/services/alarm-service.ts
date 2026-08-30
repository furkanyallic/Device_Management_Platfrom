import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlarmDto } from '../dto/create-alarm.dto';
import { UpdateAlarmStatusDto } from '../dto/update-alarm-status.dto';
import { AlarmStatus } from 'src/common/enums/alarm-status';
import { AlarmEntity } from '../entities/alarm.entity';
import { AlarmRuleService } from './alarm-rule.service';

@Injectable()
export class AlarmService {
  constructor(
    @InjectRepository(AlarmEntity)
    private readonly alarmRepository: Repository<AlarmEntity>,
    private readonly alarmRuleService: AlarmRuleService,
  ) {}

  //Yeni alarm oluştur
  async create(createDto: CreateAlarmDto): Promise<AlarmEntity> {
    const rules = await this.alarmRuleService.findByDeviceId(
      createDto.deviceId,
    );

    const ruleExist = rules.some((rule) => rule.id === createDto.ruleId);

    if (!ruleExist) {
      throw new NotFoundException(
        `${createDto.deviceId} cihazına ait bu kural bulunamadı`,
      );
    }

    const alarm = this.alarmRepository.create(createDto);
    return this.alarmRepository.save(alarm);
  }

  //Aktif alarmları bul
  async findActiveAlarms(
    deviceId: string,
    ruleId: string,
  ): Promise<AlarmEntity | null> {
    return await this.alarmRepository.findOne({
      where: {
        deviceId,
        ruleId,
        status: AlarmStatus.OPEN,
      },
    });
  }
  // Cihaz ve kurala ait OPEN durumdaki TÜM alarmları tek seferde kapatır
  async resolveAllActiveAlarms(
    deviceId: string,
    ruleId: string,
  ): Promise<number> {
    const result = await this.alarmRepository.update(
      {
        deviceId,
        ruleId,
        status: AlarmStatus.OPEN,
      },
      {
        status: AlarmStatus.RESOLVED,
      },
    );

    // Güncellenen satır sayısını döner (Eğer 0 ise zaten açık alarm yoktu demektir)
    return result.affected || 0;
  }
  //Sayfalı alarmları getir
  async findAllPaginated(
    page: number = 1,
    limit: number = 20,
    status?: AlarmStatus,
  ): Promise<{
    data: AlarmEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [data, total] = await this.alarmRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  //Alarmları getir
  async findAll(): Promise<AlarmEntity[]> {
    return await this.alarmRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByDeviceid(deviceId: string): Promise<AlarmEntity[]> {
    return await this.alarmRepository.find({
      where: { deviceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: AlarmStatus): Promise<AlarmEntity[]> {
    return await this.alarmRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  //Tek alarm getir
  async findOne(id: string): Promise<AlarmEntity> {
    const alarm = await this.alarmRepository.findOne({ where: { id } }); //Tablodaki id ile gönderilen id'ye eşit olan kaydı bulur aslında
    if (!alarm) {
      throw new NotFoundException(`Id 'si ${id} olan alarm blunamadı `);
    }
    return alarm;
  }

  //alarm durumunu güncelle
  async updateStatus(
    id: string,
    updateStatusDto: UpdateAlarmStatusDto,
  ): Promise<AlarmEntity> {
    const alarm = await this.findOne(id);
    alarm.status = updateStatusDto.status;
    return await this.alarmRepository.save(alarm);
  }

  async delete(id: string): Promise<void> {
    const alarm = await this.findOne(id);
    await this.alarmRepository.remove(alarm);
  }
}
