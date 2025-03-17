import { Module } from '@nestjs/common';
import { HistoricalDataController } from './historical-data.controller';
import { HistoricalDataAnalyzer } from './historical-data.analyzer';

@Module({
  controllers: [HistoricalDataController],
  providers: [HistoricalDataAnalyzer],
  exports: [],
})
export class HistoricalDataModule {}
