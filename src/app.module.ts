import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';
import { BenefitsModule } from './benefits/benefits.module';
import { RedisModule } from './redis/redis.module';
import { KonsiModule } from './konsi/konsi.module';
import { SearchModule } from './search/search.module';
import { ConfigModule } from '@nestjs/config';

const envFilePath =
  process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    RabbitMqModule,
    BenefitsModule,
    RedisModule,
    KonsiModule,
    SearchModule,
  ],
})
export class AppModule {}
