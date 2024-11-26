import { Module } from '@nestjs/common';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';
import { BenefitsModule } from './benefits/benefits.module';
import { RedisModule } from './redis/redis.module';
import { KonsiModule } from './konsi/konsi.module';
import { SearchModule } from './search/search.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

const envFilePath =
  process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    RabbitMqModule,
    BenefitsModule,
    RedisModule,
    KonsiModule,
    SearchModule,
  ],
})
export class AppModule {}
