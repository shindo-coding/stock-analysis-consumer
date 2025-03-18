import { Module } from '@nestjs/common';
import { NotifyModule } from './notify/notify.module';
import { FollowInvestorModule } from './follow-investor/follow-investor.module';
import { VietLottModule } from './vietlott/vietlott.module';
import { HistoricalDataModule } from './historical-data/historical-data.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    NotifyModule,
    FollowInvestorModule,
    VietLottModule,
    HistoricalDataModule,
    ExportModule,
  ],
})
export class CoreModule {}
