import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { UserConsumer } from '../../src/users/user.consumer';
import * as nock from 'nock';
import Redis from 'ioredis';

describe('UserConsumer ', () => {
  let app: INestApplication;
  let redis: Redis;
  let consumer: UserConsumer;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    consumer = app.get(UserConsumer);
    redis = app.get<Redis>('REDIS_CLIENT');
    redis.flushall();

    await app.init();
  });

  it.only('when cpfs are not in cache', async () => {
    // ARRANGE
    const CPF = '123.456.789-00';
    const konsiResponseData = [
      {
        numero_beneficio: '12345678910',
        codigo_beneficio: '12345678910',
      },
    ];

    const scope = nock('https://teste-dev-api.konsi.dev')
      .get(`/api/v1/inss/consulta-beneficios`)
      .query({ cpf: CPF })
      .reply(200, {
        success: true,
        data: konsiResponseData,
      });

    // ACT
    await consumer.consume({ cpf: CPF });

    // ASSERT
    scope.done();

    const redisData = await redis.get(CPF);

    expect(JSON.parse(redisData)).toEqual(konsiResponseData);
  });
});
