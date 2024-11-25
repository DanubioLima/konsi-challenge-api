import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';
import { BenefitsModule } from './benefits/benefits.module';
import { RedisModule } from './redis/redis.module';
import { KonsiModule } from './konsi/konsi.module';
import { SearchModule } from './search/search.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    RabbitMqModule,
    BenefitsModule,
    RedisModule,
    KonsiModule,
    SearchModule,
  ],
})
export class AppModule {}
