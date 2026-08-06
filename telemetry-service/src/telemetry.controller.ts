import { Controller } from "@nestjs/common";
import {MessagePattern,Payload} from '@nestjs/microservices'
import { TelemetryService } from "./telemetry.service";

@Controller()
export class TelemetryController{
    constructor (private readonly telemetryService:TelemetryService){}

    @MessagePattern('iot.telemetry.raw') //Kafka ile mesajı consume ettiğimiz yer.
    async handleTelemetryStream(@Payload() message:any){
        try{
            const telemetryData=message
            await this.telemetryService.saveTelemetry(telemetryData)
            console.log(`Telemetry kaydedildi , device:${telemetryData.deviceId}`)
        }catch(err){
            console.error("Telemetry kaydetme hatası",err)
        }
    }
}
