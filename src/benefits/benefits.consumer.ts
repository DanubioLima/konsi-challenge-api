import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { KonsiService } from '../konsi/konsi.service';
import { SearchService } from '../search/search.service';

@Injectable()
export class BenefitsConsumer {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    private readonly konsiService: KonsiService,
    private readonly searchService: SearchService,
  ) {}

  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'users',
    queue: 'users_cpf',
    allowNonJsonMessages: true,
  })
  public async consume(msg: { cpf: string }) {
    const cpf = msg.cpf.replace(/[.-]/g, '');
    const redisData = await this.redis.get(cpf);

    if (redisData) {
      return;
    }

    const response = await this.konsiService.getBenefits(msg.cpf);

    await this.redis.set(cpf, JSON.stringify(response));

    await Promise.all(
      response.beneficios.map(async (benefit) => {
        this.searchService.addDocument('benefits', {
          ...benefit,
          cpf: cpf,
        });
      }),
    );

    return response;
  }
}
