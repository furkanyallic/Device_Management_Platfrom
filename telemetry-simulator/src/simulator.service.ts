import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { timestamp } from 'rxjs';

@Injectable()
export class SimulatorService implements OnModuleInit,OnModuleDestroy{
    private intervalId:NodeJS.Timeout

    private sampleDeviceIds=[
        'c39a8c14-2b3d-4e23-a123-123456789abc',
        'f47ac10b-58cc-4372-a567-0e02b2c3d4e5',
        '7b9e2101-3a11-49b8-b456-9d8e7f6a5b4c',
    ];

    constructor(private readonly KafkaService:KafkaService){}//Kafka servis provider'ı bulunuyor hem de arkada nestJs Kafkaservice'in instance'ını oluşturuyor.

    onModuleInit(){
        this.intervalId=setInterval(()=>{
            this.generateAndSendTelemetry()
        },5000)
        console.log('Telemetry Simulator başlatıldı')
    }

    onModuleDestroy(){
      if(this.intervalId){
        clearInterval(this.intervalId)
      } 
    }  
      private async generateAndSendTelemetry(){
        const topic='iot.telemetry.raw'
        for(const deviceId of this.sampleDeviceIds){

            const payload={
                deviceId,
                timestamp:new Date().toISOString(),
                metrics:{
                    temperature:0,
                    humidity:0,
                    voltage:0,
                    current:0,
                    power:0,
                    frequency:0,
                    pressure:0,
                    vibration:0,
                    batteryLevel:0
                }
            }
            try{
                await this.KafkaService.sendTelemetry(topic,deviceId,payload)
                console.log(`Telemetry gönderildi device : ${deviceId}`)
            }catch(error){
                console.error(`Telemetry gönderim hatası ($deviceId)`,error)
            }

        }
      }
    }


