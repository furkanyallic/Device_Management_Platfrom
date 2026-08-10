import { Injectable, OnModuleInit, OnModuleDestroy,Logger} from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { timestamp } from 'rxjs';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class SimulatorService implements OnModuleInit,OnModuleDestroy{
    private readonly logger = new Logger(SimulatorService.name);
    private intervalId:NodeJS.Timeout

    private sampleDeviceIds=[
        'c39a8c14-2b3d-4e23-a123-123456789abc',
        'f47ac10b-58cc-4372-a567-0e02b2c3d4e5',
        '7b9e2101-3a11-49b8-b456-9d8e7f6a5b4c',
    ];

    constructor(
        private readonly KafkaService:KafkaService,
        private readonly RabbbitMQService:RabbbitMQService
     ){}//Kafka servis provider'ı bulunuyor hem de arkada nestJs Kafkaservice'in instance'ını oluşturuyor.

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
        const routingKey='telemetry.data'
        for(const deviceId of this.sampleDeviceIds){

            const payload={
                deviceId,
                timestamp:new Date().toISOString(),
                metrics:{
                temperature: parseFloat((20 + Math.random() * 70).toFixed(2)), // 20 - 90 °C
                humidity: parseFloat((30 + Math.random() * 50).toFixed(2)),    // %30 - %80
                voltage: parseFloat((210 + Math.random() * 30).toFixed(2)),    // 210 - 240 V
                current: parseFloat((1 + Math.random() * 15).toFixed(2)),      // 1 - 16 A
                power: parseFloat((100 + Math.random() * 2000).toFixed(2)),   // 100 - 2100 W
                frequency: 50,
                pressure: parseFloat((0.9 + Math.random() * 0.3).toFixed(2)),
                vibration: parseFloat((0.1 + Math.random() * 2.5).toFixed(2)),
                batteryLevel: Math.floor(20 + Math.random() * 80),
                }
            }
            try{
                await this.KafkaService.sendTelemetry(topic,deviceId,payload)

                await this.RabbbitMQService.sendTelemetry(routingKey,payload)
                this.logger.log(`Telemetry gönderildi device : ${deviceId}`)
            }catch(error){
                console.error(`Telemetry gönderim hatası ($deviceId)`,error)
            }

        }
      }
    }


