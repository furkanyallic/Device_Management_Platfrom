import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlarmRuleEntity } from '../entities/alarm-rule.entity';
import { CreateAlarmRuleDto } from '../dto/create-alarm-rule.dto';
import { UpdateAlarmRuleDto } from '../dto/update-alarm-rule.dto';

@Injectable()
export class AlarmRuleService {
  constructor(
    @InjectRepository(AlarmRuleEntity)
    private readonly ruleRepository: Repository<AlarmRuleEntity>,
  ) {}

  //  Yeni kural oluştur
  async create(createDto: CreateAlarmRuleDto): Promise<AlarmRuleEntity> {
    const rule = this.ruleRepository.create(createDto);
    return await this.ruleRepository.save(rule);
  }

  //  Tüm kuralları getir
  async findAll(): Promise<AlarmRuleEntity[]> {
    return await this.ruleRepository.find();
  }

  // Cihaza Göre Kuralları Getir (Simülatör veriyi kontrol ederken bu fonksiyonu kullanacağız)
  async findByDeviceId(deviceId: string): Promise<AlarmRuleEntity[]> {
    return await this.ruleRepository.find({
      where: { deviceId, isActive: true },
    });
  }

  // tek bir kural getir
  async findOne(id: string): Promise<AlarmRuleEntity> {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Kural bulunamadı (ID: ${id})`);
    }
    return rule;
  }

  // 5. kural güncelle
  async update(
    id: string,
    updateDto: UpdateAlarmRuleDto,
  ): Promise<AlarmRuleEntity> {
    const rule = await this.findOne(id);
    Object.assign(rule, updateDto);
    return await this.ruleRepository.save(rule);
  }

  // 6. Kural Sil
  async remove(id: string): Promise<void> {
    const rule = await this.findOne(id);
    await this.ruleRepository.remove(rule);
  }
}
