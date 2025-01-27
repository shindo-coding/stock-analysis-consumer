import { Module } from '@nestjs/common';
import { FollowInvestorController } from './follow-investor.controller';
import { FollowInvestorService } from './follow-investor.service';

@Module({
  controllers: [FollowInvestorController],
  providers: [FollowInvestorService],
  exports: [],
})
export class FollowInvestorModule {}
