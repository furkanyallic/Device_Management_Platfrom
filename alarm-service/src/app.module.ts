import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmEntity } from './alarms/entities/alarm.entity';
import { AlarmRuleEntity } from './alarms/entities/alarm-rule.entity';
import { AlarmModule } from './alarms/alarm.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5436),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', '2129374'),
        database: config.get<string>('DB_NAME', 'alarm_db'),
        entities: [AlarmEntity, AlarmRuleEntity],
        synchronize: true, // Tabloları veritabanında otomatik oluşturur
      }),
    }),
    AlarmModule,
  ],
})
export class AppModule {}
