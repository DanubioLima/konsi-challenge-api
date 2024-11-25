import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: 'http://localhost:9200',
      auth: {
        apiKey: 'NWlscllKTUJjVGdOeldCczN2UEo6YWdhWE1XS3VRZmFXeWdqQTVXb2w2dw==',
      },
    }),
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
