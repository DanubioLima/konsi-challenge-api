import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import nock from 'nock';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { KonsiService } from '../../src/konsi/konsi.service';

describe('KonsiService ', () => {
  let app: INestApplication;
  let redis: Redis;
  let configService: ConfigService;

  const REDIS_TOKEN_DATA = 'konsi:token_data';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    redis = app.get<Redis>('REDIS_CLIENT');
    configService = app.get(ConfigService);
    redis.flushall();

    await app.init();
  });

  afterEach(async () => {
    await redis.quit();
    await app.close();
  });

  it('should get new token when current token expires in less than 1 minute', async () => {
    // ARRANGE
    const initialToken = 'initial-token';
    const initialExpiry = new Date(Date.now() - 29 * 60 * 1000).toISOString();
    await redis.set(
      REDIS_TOKEN_DATA,
      JSON.stringify({ token: initialToken, expiresIn: initialExpiry }),
    );

    const newExpiresIn = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newToken = 'new-token';

    const tokenScope = nock(configService.get('KONSI_BASE_URL'))
      .post('/api/v1/token')
      .reply(200, {
        success: true,
        data: {
          token: newToken,
          expiresIn: newExpiresIn,
        },
      });

    // ACT
    const konsiService = app.get(KonsiService);
    const result = await konsiService.getAccessToken();

    // ASSERT
    tokenScope.done();
    expect(result).toBe(newToken);

    const tokenData = await redis.get(REDIS_TOKEN_DATA);
    const { token: storedToken, expiresIn: storedExpiry } =
      JSON.parse(tokenData);

    expect(storedToken).toBe(newToken);
    expect(storedExpiry).toEqual(newExpiresIn);
  });

  it('should return current token when it not expired', async () => {
    // ARRANGE
    const initialToken = 'initial-token';
    const initialExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await redis.set(
      REDIS_TOKEN_DATA,
      JSON.stringify({ token: initialToken, expiresIn: initialExpiry }),
    );

    // ACT
    const konsiService = app.get(KonsiService);
    const result = await konsiService.getAccessToken();

    // ASSERT
    expect(result).toBe(initialToken);
  });
});
