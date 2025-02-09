import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StockRepository } from './stock/stock.repository';
import { FireAntService } from './stock/fireant.service';
import { VietLottService } from './stock/vietlott.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [StockRepository, FireAntService, VietLottService],
  exports: [HttpModule, StockRepository, FireAntService, VietLottService],
})
export class DataModule {}
