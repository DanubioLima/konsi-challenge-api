import { Module } from '@nestjs/common';
import { BenefitsConsumer } from './benefits.consumer';
import { KonsiModule } from '../konsi/konsi.module';
import { SearchModule } from '../search/search.module';
import { BenefitsController } from './benefits.controller';

@Module({
  imports: [KonsiModule, SearchModule],
  providers: [BenefitsConsumer],
  controllers: [BenefitsController],
})
export class BenefitsModule {}
