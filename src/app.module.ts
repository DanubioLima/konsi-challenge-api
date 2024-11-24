import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import { KonsiModule } from './konsi/konsi.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [RabbitMqModule, UsersModule, RedisModule, KonsiModule],
})
export class AppModule {}
