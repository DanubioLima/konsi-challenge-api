import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTIC_API_URL'),
        auth: {
          apiKey: configService.get<string>('ELASTIC_API_KEY'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
