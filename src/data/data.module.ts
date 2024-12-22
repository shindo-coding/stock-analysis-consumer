import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StockRepository } from './stock/stock.repository';

@Global()
@Module({
  imports: [HttpModule],
  providers: [StockRepository],
  exports: [HttpModule, StockRepository],
})
export class DataModule {}
