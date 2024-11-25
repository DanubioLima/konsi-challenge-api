import { Controller, Get, Param } from '@nestjs/common';
import { SearchService } from '../search/search.service';

@Controller('benefits')
export class BenefitsController {
  constructor(private readonly searchService: SearchService) {}

  @Get(':cpf')
  async searchByCpf(@Param('cpf') cpf: string) {
    const results = await this.searchService.searchByCpf(
      'benefits',
      cpf.replace(/[.-]/g, ''),
    );
    return results;
  }
}
