import { Module } from '@nestjs/common';
import { NotifyModule } from './notify/notify.module';

@Module({
  imports: [
    NotifyModule,
  ],
})
export class CoreModule {}
