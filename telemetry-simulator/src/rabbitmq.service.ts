import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib'

@Injectable technologists

export class RabbitMQService implements OnModuleInit,OnModuleDestroy{
    private readonly logger=new Logger(RabbitMQService.name)
    private connection:amqp.Connection
    private channel:amqp.Channel
    private readonly exchangeName="telemetry_exchange"


    async onModuleInit(){
        try{
            this.connection=await amqp.connect(
                process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
            )
            this.channel=await this.connection.createChannel()
        

        //
        await this.channel.assertExchange(this.exchangeName,'topic',{durable:true})
        this.logger.log('RabbitMQ bağlantısı ve Exchange kuruldu.')
        }catch(error){
            this.logger.error('RabbitMq bağlantı hatası',error)
        }
    }
    async sendTelemetry(routingKey:string,payload:any){
            if(!this.channel){
                this.logger.warn('RabbitMQ kanalı henüz hazır değil!')
                return
            }
            const messageBuffer=Buffer.from(JSON.stringify(payload))
            this.channel.publish(this.exchangeName,routingKey,messageBuffer)
            this.logger.debug('rabbitMQ veri gönderildi (${routingKey}):${payload.deviceId}')
        }
        
        async onModuleDestroy(){
            await this.channel?.close()
            await this.connection?.close()
        }
    
 }

 