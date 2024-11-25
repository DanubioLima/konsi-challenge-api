import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('RABBITMQ_URI'),
        connectionInitOptions: { wait: false },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class RabbitMqModule {}
