import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { BenefitDataResponse } from './konsi.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KonsiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getBenefits(cpf: string): Promise<BenefitDataResponse[]> {
    const response = await this.getResponse(
      `api/v1/inss/consulta-beneficios?cpf=${cpf}`,
    );

    return response.data;
  }

  private async getResponse(url: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.getBaseURL()}/${url}`),
    );
    return response.data;
  }

  private getBaseURL() {
    return this.configService.get<string>('KONSI_BASE_URL');
  }
}
