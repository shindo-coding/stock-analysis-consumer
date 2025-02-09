import { Module } from '@nestjs/common';
import { NotifyModule } from './notify/notify.module';
import { FollowInvestorModule } from './follow-investor/follow-investor.module';
import { VietLottModule } from './vietlott/vietlott.module';

@Module({
  imports: [
    NotifyModule,
    FollowInvestorModule,
    VietLottModule,
  ],
})
export class CoreModule {}
