import { Module } from '@nestjs/common';
import { UserConsumer } from './user.consumer';
import { KonsiModule } from '../konsi/konsi.module';

@Module({
  imports: [KonsiModule],
  providers: [UserConsumer],
})
export class UsersModule {}
