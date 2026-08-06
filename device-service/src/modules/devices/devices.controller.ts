import { Controller,
 Get,
 Post,
 Body,
 Patch,
 Param,
 Delete,
 HttpCode,
 HttpStatus
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Controller('devices')
export class DevicesController {
    constructor(private readonly devicesService:DevicesService){}


@Post()
async create(@Body() createDeviceDto:CreateDeviceDto){
    return await this.devicesService.create(createDeviceDto)
}

@Get()
async findAll(){
    return await this.devicesService.findAll()
}

@Get(':id')
async findOne(@Param('id') id:string){
    return await this.devicesService.findOne(id)
}

@Patch(':id')
async update(
    @Param('id') id:string,
    @Body() updateDeviceDto:UpdateDeviceDto 
){
    return await this.devicesService.update(id,updateDeviceDto)
}

@Delete (':id')
@HttpCode(HttpStatus.NO_CONTENT)

async remove(@Param('id') id:string){
    await this.devicesService.delete(id)
}

}