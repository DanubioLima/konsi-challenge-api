import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async addDocument(index: string, payload: any) {
    const result = await this.elasticsearchService.index({
      index,
      document: payload,
    });
    return result;
  }

  async searchByCpf(index: string, cpf: string) {
    const result = await this.elasticsearchService.search({
      index,
      query: {
        match: {
          cpf: cpf,
        },
      },
    });

    return result.hits.hits.map((hit) => hit._source) || [];
  }

  async findIfExistsByCpfAndBenefit(
    index: string,
    cpf: string,
    benefit: string,
  ) {
    const result = await this.elasticsearchService.count({
      index,
      query: {
        bool: {
          must: [
            {
              term: {
                numero_beneficio: benefit,
              },
            },
            {
              term: {
                cpf,
              },
            },
          ],
        },
      },
    });

    return result.count > 0;
  }
}
