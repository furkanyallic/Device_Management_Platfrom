import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { AlarmRuleService } from './alarm-rule.service';
import { AlarmService } from './alarm-service';
import * as amqp from 'amqplib';
import { AlarmSeverity } from 'src/common/enums/alarm-severity';
import { NotificationProducerService } from './notification-producer.service';

@Injectable()
export class TelemetryConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelemetryConsumerService.name);
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;

  private readonly exchangeName = 'telemetry_exchange';
  private readonly queueName = 'alarm_telemetry_queue';
  private readonly routingKey = 'telemetry.data';

  constructor(
    private readonly alarmRuleService: AlarmRuleService,
    private readonly alarmService: AlarmService,
    private readonly notificationProducerService: NotificationProducerService,
  ) {
    console.log('alarmRuleService enjekte edildi mi?', !!this.alarmRuleService);
  }

  async onModuleInit() {
    await this.connectAndListen();
  }

  private async connectAndListen() {
    try {
      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
      );
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true,
      });
      await this.channel.assertQueue(this.queueName, { durable: true });
      await this.channel.bindQueue(
        this.queueName,
        this.exchangeName,
        this.routingKey,
      );

      this.logger.log(
        ` RabbitMQ Consumer dinlemede: Kuyruk : '${this.queueName}'`,
      );

      this.channel.consume(this.queueName, async (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());

            await this.processTelemetry(content);

            this.channel.ack(msg);
          } catch (error) {
            this.logger.error('Mesaj işleme hatası ', error);
            this.channel.nack(msg, false, false);
          }
        }
      });
    } catch (error) {
      this.logger.error(
        'RabbitMQ bağlantı hatası, 5 sn sonra tekrar denenecek',
      );
      setTimeout(() => this.connectAndListen(), 5000);
    }
  }

  // Telemetry verisini kurallarla karşılaştırma
  private async processTelemetry(telemetryPayload: any) {
    const { deviceId, deviceName, metrics } = telemetryPayload;

    if (!deviceId || !metrics) return;

    // Cihaza tanımlı kuralları db'den çek
    const rules = await this.alarmRuleService.findByDeviceId(deviceId);
    if (!rules || rules.length === 0) return;

    // Kuralı gelen metriklerle kıyasla
    for (const rule of rules) {
      const metricValue = metrics[rule.metricName];

      if (metricValue !== undefined) {
        const isTriggered = this.evaluateThreshold(
          metricValue,
          rule.operator,
          rule.threshold,
        );

        if (isTriggered) {
          this.logger.warn(
            `Alarm tetiklendi device:${deviceId} | ${rule.metricName}: ${metricValue} ${rule.operator} ${rule.threshold}`,
          );

          // Aşım var: DB'ye kaydet ve bildirimi at
          const savedAlarm = await this.alarmService.create({
            deviceId,
            ruleId: rule.id,
            title: `${rule.metricName.toUpperCase()} eşik değeri aşıldı`,
            description: `${rule.metricName} metriği ${metricValue} değerine ulaştı`,
            severity: rule.severity || AlarmSeverity.WARNING,
            triggerValue: metricValue,
          });

          await this.notificationProducerService.sendAlarmNotification({
            alarmId: savedAlarm.id,
            deviceId: savedAlarm.deviceId,
            deviceName: deviceName || 'Bilinmeyen Cihaz',
            ruleName: rule.metricName,
            severity: savedAlarm.severity,
            triggerValue: savedAlarm.triggerValue,
            threshold: rule.threshold,
            eventType: 'TRIGGERED',
          });
        } else {
          // Değer normale döndü: Açıkta kalan tüm alarmları tek seferde kapat
          const resolvedCount = await this.alarmService.resolveAllActiveAlarms(
            deviceId,
            rule.id,
          );

          // SADECE daha önce açık alarm vardıysa ve yeni kapatıldıysa TEK BİR mail at
          if (resolvedCount > 0) {
            this.logger.log(
              ` Alarm düzeldi (${resolvedCount} adet kayıt kapatıldı) -> Cihaz: ${deviceName || deviceId} | ${rule.metricName}: ${metricValue}`,
            );

            await this.notificationProducerService.sendAlarmNotification({
              alarmId: deviceId,
              deviceId,
              deviceName: deviceName || 'Bilinmeyen Cihaz',
              ruleName: rule.metricName,
              severity: rule.severity || AlarmSeverity.WARNING,
              triggerValue: metricValue,
              threshold: rule.threshold,
              eventType: 'RESOLVED',
            });
          }
        }
      }
    }
  }

  private evaluateThreshold(
    value: number,
    operator: string,
    threshold: number,
  ): boolean {
    switch (operator) {
      case '>':
        return value > threshold;
      case '>=':
        return value >= threshold;
      case '<':
        return value < threshold;
      case '<=':
        return value <= threshold;
      case '==':
        return value === threshold;
      default:
        return false;
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
