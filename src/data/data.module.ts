import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StockRepository } from './stock/stock.repository';
import { FireAntService } from './stock/fireant.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [StockRepository, FireAntService],
  exports: [HttpModule, StockRepository, FireAntService],
})
export class DataModule {}
