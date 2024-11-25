import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { BenefitsConsumer } from '../../src/benefits/benefits.consumer';
import nock from 'nock';
import Redis from 'ioredis';
import { SearchService } from '../../src/search/search.service';
import { ConfigService } from '@nestjs/config';

describe('BenefitsConsumer ', () => {
  let app: INestApplication;
  let redis: Redis;
  let consumer: BenefitsConsumer;
  let searchService: SearchService;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    consumer = app.get(BenefitsConsumer);
    redis = app.get<Redis>('REDIS_CLIENT');
    searchService = app.get(SearchService);
    configService = app.get(ConfigService);
    redis.flushall();

    await app.init();
  });

  afterEach(async () => {
    await redis.quit();
    await app.close();
  });

  it('when cpfs are not in cache', async () => {
    // ARRANGE
    const CPF = '12345678900';
    const konsiResponseData = [
      {
        numero_beneficio: '12345678910',
        codigo_beneficio: '12345678910',
      },
    ];

    mockElasticAddDocument();

    const scope = nock(configService.get('KONSI_BASE_URL'))
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

  function mockElasticAddDocument() {
    jest
      .spyOn(searchService, 'addDocument')
      .mockImplementation(() => new Promise(() => {}));
  }
});
