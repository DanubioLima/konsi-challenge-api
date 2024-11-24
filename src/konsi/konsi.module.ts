import { Module } from '@nestjs/common';
import { KonsiService } from './konsi.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [KonsiService],
  exports: [KonsiService],
})
export class KonsiModule {}
