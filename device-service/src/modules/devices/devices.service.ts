import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DeviceEntity } from './entitites/device.entity';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
    private readonly redisService: RedisService,
  ) {}

  //Yeni cihaz oluşturuyoruz
  async create(createDeviceDto: CreateDeviceDto): Promise<DeviceEntity> {
    const existingDevice = await this.deviceRepository.findOne({
      where: { serialNumber: createDeviceDto.serialNumber },
    });

    if (existingDevice) {
      throw new ConflictException('Bu seri numarasına ait bir cihaz bulunuyor');
    }
    const newDevice = this.deviceRepository.create(createDeviceDto);
    const savedDevice = await this.deviceRepository.save(newDevice); //Db 'ye kaydettiğimiz kısım

    await this.redisService.addDevice(savedDevice.id);

    return savedDevice;
  }

  //Tüm cihazları getiriyoruz
  async findAll(): Promise<DeviceEntity[]> {
    return await this.deviceRepository.find();
  }

  //Id'ye göre cihaz getiriyoruz
  async findOne(id: string): Promise<DeviceEntity> {
    const device = await this.deviceRepository.findOne({
      where: { id },
    });
    if (!device) {
      throw new NotFoundException(`Id'si ${id} olan cihaz bulunamadı`);
    }

    return device;
  }

  //Cihazı  güncelliyoruz
  async update(
    id: string,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceEntity> {
    const device = await this.findOne(id); // Yukarıda tanımladığımız findone'ı kullanarak device'ı çekiyoruz
    Object.assign(device, updateDeviceDto); // Object.assign ikinci nesnedeki alanları birinci nesne üzerine kopyalar.Tek satırda tüm alanları kopyalamayı sağlar.
    return await this.deviceRepository.save(device);
  }

  async delete(id: string): Promise<void> {
    const device = await this.findOne(id);
    await this.deviceRepository.remove(device);

    await this.redisService.removeDevice(id);
  }
}
