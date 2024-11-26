import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { KonsiService } from '../konsi/konsi.service';
import { SearchService } from '../search/search.service';
import { Mutex } from 'redis-semaphore';
import { Benefit } from '../konsi/konsi.types';

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
    routingKey: 'benefits',
    queue: 'benefits_cpf',
    allowNonJsonMessages: true,
  })
  public async consume(msg: { cpf: string }) {
    const cpf = msg.cpf.replace(/[.-]/g, '');

    const redisClient = new Redis();
    const mutex = new Mutex(redisClient, cpf);
    await mutex.acquire();

    try {
      const redisData = await this.redis.get(cpf);

      if (redisData) {
        return;
      }

      const response = await this.konsiService.getBenefits(cpf);

      await this.redis.set(cpf, JSON.stringify(response), 'EX', 1800);

      await Promise.all(
        response.beneficios.map((benefit) => this.addBenefit(cpf, benefit)),
      );
    } finally {
      await mutex.release();
      await redisClient.quit();
    }
  }

  private async addBenefit(cpf: string, benefit: Benefit) {
    const exists = await this.searchService.findIfExistsByCpfAndBenefit(
      'benefits',
      cpf,
      benefit.numero_beneficio,
    );

    if (exists) return;

    await this.searchService.addDocument('benefits', {
      ...benefit,
      cpf: cpf,
    });

    this.logger.log(`Benefits for CPF ${cpf} added to the 'benefits' index`);
  }
}
