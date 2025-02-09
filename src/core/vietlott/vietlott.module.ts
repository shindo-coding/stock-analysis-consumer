import { Module } from '@nestjs/common';
import { VietLottController } from './vietlott.controller';

@Module({
  controllers: [VietLottController],
  providers: [],
  exports: [],
})
export class VietLottModule {}
