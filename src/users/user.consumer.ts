import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { KonsiService } from '../konsi/konsi.service';

@Injectable()
export class UserConsumer {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    private readonly konsiService: KonsiService,
  ) {}

  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'users',
    queue: 'users_cpf',
    allowNonJsonMessages: true,
  })
  public async consume(msg: { cpf: string }) {
    const cpfExists = await this.redis.get(msg.cpf);

    if (cpfExists) {
      // TODO: Implement the logic to return the cached data
    } else {
      const response = await this.konsiService.getBenefits(msg.cpf);

      await this.redis.set(msg.cpf, JSON.stringify(response));
    }
  }
}
