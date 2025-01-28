import { Module } from '@nestjs/common';
import { NotifyModule } from './notify/notify.module';
import { FollowInvestorModule } from './follow-investor/follow-investor.module';

@Module({
  imports: [
    NotifyModule,
    FollowInvestorModule,
  ],
})
export class CoreModule {}
