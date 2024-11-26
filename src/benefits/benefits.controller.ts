import { Controller, Get, Param } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { CpfParams } from './benefits.dto';

@Controller('benefits')
export class BenefitsController {
  constructor(private readonly searchService: SearchService) {}

  @Get(':cpf')
  async searchByCpf(@Param() params: CpfParams) {
    const results = await this.searchService.searchByCpf(
      'benefits',
      params.cpf.replace(/[.-]/g, ''),
    );
    return results;
  }
}
