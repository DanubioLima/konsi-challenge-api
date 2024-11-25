import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Inject, Logger } from '@nestjs/common';
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

  private readonly logger = new Logger(BenefitsConsumer.name);

  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'users',
    //queue: 'users_cpf',
    allowNonJsonMessages: true,
  })
  public async consume(msg: { cpf: string }) {
    const cpf = msg.cpf.replace(/[.-]/g, '');
    const redisData = await this.redis.get(cpf);

    this.logger.log(
      `Consuming message for CPF ${cpf}, redisData: ${redisData}`,
    );

    if (redisData) {
      this.logger.log('The CPF is already in cache');
      return;
    }

    const response = await this.konsiService.getBenefits(cpf);

    const result = await this.redis.set(
      cpf,
      JSON.stringify(response),
      'EX',
      1800,
    );

    if (!result) {
      this.logger.error(`Error saving CPF ${cpf} in cache`);
    }

    for (const benefit of response.beneficios) {
      const exists = await this.searchService.findIfExistsByCpfAndBenefit(
        'benefits',
        cpf,
        benefit.numero_beneficio,
      );

      if (exists) {
        this.logger.log(
          `Benefit ${benefit.numero_beneficio} already exists for CPF ${cpf}`,
        );
        continue;
      }

      this.logger.log(
        `Adding benefit ${benefit.numero_beneficio} to CPF ${cpf}`,
      );
      this.searchService.addDocument('benefits', {
        ...benefit,
        cpf: cpf,
      });
    }

    return;
  }
}
