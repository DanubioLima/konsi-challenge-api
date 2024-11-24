import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { KonsiApiResponse } from './konsi.types';

@Injectable()
export class KonsiService {
  constructor(private readonly httpService: HttpService) {}

  async getBenefits(cpf: string): Promise<KonsiApiResponse> {
    const response = await this.getResponse(
      `api/v1/inss/consulta-beneficios?cpf=${cpf}`,
    );

    return response.data;
  }

  private async getResponse(url: string) {
    const response = await firstValueFrom(
      this.httpService.get(`https://teste-dev-api.konsi.dev/${url}`),
    );
    return response.data;
  }
}
