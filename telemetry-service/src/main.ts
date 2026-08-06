import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Endpointler için 3003 portunu belirledik
  const app = await NestFactory.create(AppModule);

  // 2. Kafka Microservice Dinleyicisi (Consumer Group)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'telemetry-service',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        // Consumer Group id aynı gruptaki servisler mesajları paylaşarak işlemesini sağlar
        groupId: 'telemetry-consumer-group',
      },
    },
  });

  // Microservice bağlantısını başlat
  await app.startAllMicroservices();

  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(` Telemetry Service running on port: ${port}`);
  console.log(` Kafka Consumer listening for telemetry stream...`);
}
bootstrap();