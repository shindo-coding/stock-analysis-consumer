import { Module } from '@nestjs/common';
import { NotifyConsumer } from './notify.consumer';

@Module({
  providers: [NotifyConsumer],
  exports: [],
})
export class NotifyModule {}
