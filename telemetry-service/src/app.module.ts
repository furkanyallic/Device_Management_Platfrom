import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryRecordEntity } from './entities/telemetry-record.entity';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5434), // telemetry_db portu (5434)
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', '2129374'),
        database: configService.get<string>('DB_NAME', 'telemetry_db'),
        entities: [TelemetryRecordEntity],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([TelemetryRecordEntity]),
  ],
  controllers: [TelemetryController],
  providers: [TelemetryService],
})
export class AppModule {}
