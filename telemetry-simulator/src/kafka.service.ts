import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable ()
export class KafkaService implements OnModuleInit,OnModuleDestroy{
    private kafka:Kafka;
    private producer:Producer

    constructor(){
        this.kafka=new Kafka({
            clientId:"telemetry-simulator",
            brokers:[process.env.KAFKA_BROKER || 'localhost:9092']
        })
        this.producer=this.kafka.producer()
    }

    async onModuleInit() {
        await this.producer.connect()
        console.log("Kafka producer bağlandı")
    }

      async onModuleDestroy() {
        await this.producer.disconnect()
        console.log("Kafka producer bağlantısı kesildi")
    }

    //Mesaj gönderme metodumuz
    async sendTelemetry(topic:string,deviceId:string,payload:any){
        await this.producer.send({
            topic,
            messages:[
             {   key:deviceId,
                value:JSON.stringify(payload)
             }
            ]
        })
    }

}