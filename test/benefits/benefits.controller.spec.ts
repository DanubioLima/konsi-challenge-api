import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import Redis from 'ioredis';
import request from 'supertest';
import { ElasticsearchService } from '@nestjs/elasticsearch';

describe('BenefitsController ', () => {
  let app: INestApplication;
  let redis: Redis;
  let elasticsearchService: ElasticsearchService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    redis = app.get<Redis>('REDIS_CLIENT');
    elasticsearchService = app.get(ElasticsearchService);
    redis.flushall();

    await app.init();
  });

  afterEach(async () => {
    redis.flushall();
    await redis.quit();
    await app.close();
  });

  it('should get benefits from cpf', async () => {
    // ARRANGE
    const CPF = '12345678900';
    mockElasticsearchService();

    // ACT
    const response = await request(app.getHttpServer())
      .get(`/benefits/${CPF}`)
      .expect(200);

    // ASSERT
    expect(response.body).toEqual([
      {
        numero_beneficio: '12345678910',
        codigo_tipo_beneficio: '12345678910',
        cpf: '12345678900',
      },
      {
        numero_beneficio: '12345678910',
        codigo_tipo_beneficio: '12345678910',
        cpf: '12345678900',
      },
    ]);
  });

  it('should not accept cpf with wrong length', async () => {
    // ARRANGE
    const CPF = '123456789002830404004';

    // ACT
    const response = await request(app.getHttpServer())
      .get(`/benefits/${CPF}`)
      .expect(400);

    // ASSERT
    expect(response.body.message).toEqual([
      'cpf must be shorter than or equal to 14 characters',
    ]);
  });

  // for some reason is not possible mock http requests to elastic API so i need to mock the service
  function mockElasticsearchService() {
    jest.spyOn(elasticsearchService, 'search').mockResolvedValue({
      took: 1,
      timed_out: false,
      _shards: {
        total: 1,
        successful: 1,
        skipped: 0,
        failed: 0,
      },
      hits: {
        total: {
          value: 2,
          relation: 'eq',
        },
        max_score: 0.18232156,
        hits: [
          {
            _index: 'benefits',
            _id: 'DCmWYJMBcTgNzWBsL_SJ',
            _score: 0.18232156,
            _source: {
              numero_beneficio: '12345678910',
              codigo_tipo_beneficio: '12345678910',
              cpf: '12345678900',
            },
          },
          {
            _index: 'benefits',
            _id: 'DSmdYJMBcTgNzWBs_vRg',
            _score: 0.18232156,
            _source: {
              numero_beneficio: '12345678910',
              codigo_tipo_beneficio: '12345678910',
              cpf: '12345678900',
            },
          },
        ],
      },
    });
  }
});
