import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { BenefitDataResponse, TokenResponse } from './konsi.types';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class KonsiService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  REDIS_TOKEN_KEY = this.configService.get<string>('REDIS_TOKEN_KEY');

  async getBenefits(cpf: string): Promise<BenefitDataResponse> {
    const response = await this.getResponse(
      `api/v1/inss/consulta-beneficios?cpf=${cpf}`,
    );

    return response.data;
  }

  private async getResponse(url: string) {
    const accessToken = await this.getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    const response = await firstValueFrom(
      this.httpService.get(`${this.getBaseURL()}/${url}`, { headers }),
    );

    return response.data;
  }

  private getBaseURL() {
    return this.configService.get<string>('KONSI_BASE_URL');
  }

  async getAccessToken(): Promise<string> {
    const ONE_MINUTE = 60 * 1000; // in milliseconds

    const tokenData = await this.redis.get(this.REDIS_TOKEN_KEY);

    if (!tokenData) {
      return this.setNewToken();
    }

    const { token, expiresIn } = JSON.parse(tokenData);

    const expiryDate = new Date(expiresIn);
    const now = new Date();
    if (expiryDate.getTime() - now.getTime() > ONE_MINUTE) {
      return token;
    }

    return this.setNewToken();
  }

  private async setNewToken(): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.post<TokenResponse>(
        `${this.getBaseURL()}/api/v1/token`,
        {
          username: this.configService.get<string>('KONSI_USERNAME'),
          password: this.configService.get<string>('KONSI_PASSWORD'),
        },
      ),
    );

    const { token } = response.data.data;

    await this.redis.set(
      this.REDIS_TOKEN_KEY,
      JSON.stringify(response.data.data),
    );

    return token;
  }
}
