import { Body, Controller, Post, Put } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { marketCodeTableNameMap } from 'src/constant/stock-market';
import { FireAntService } from 'src/data/stock/fireant.service';
import { StockRepository } from 'src/data/stock/stock.repository';
import { TickerHistorical } from 'src/data/stock/types';
import { HistoricalDataAnalyzer } from './historical-data.analyzer';
import { DatabricksHistoricalData } from '@prisma/client';
import { subDays } from 'date-fns';

@Controller('historical-data')
export class HistoricalDataController {
  constructor(
    private readonly stockRepository: StockRepository,
    private readonly fireAntService: FireAntService,
    private readonly historicalDataAnalyzer: HistoricalDataAnalyzer,
  ) {}

  // TODO: removed this method once the data analysis is finished
  async analyzeHistoricalData(ticker: string) {
    let lookbackDays = 365;
    const today = new Date();
    while (lookbackDays > 0) {
      const analysisResult = await this.historicalDataAnalyzer.analyze(
        ticker,
        lookbackDays,
      );
      const data: Partial<DatabricksHistoricalData> = {
        symbol: ticker,
        lookbackDays,
        reasons: analysisResult.reasons.join(', '),
        riskLevel: analysisResult.riskLevel,
        isGoodBuyingPoint: analysisResult.isGoodBuyingPoint,
        date: subDays(today, lookbackDays),
      };
      await this.stockRepository.insertAnalyzedHistoricalData(data);
      lookbackDays -= 1;
    }
    console.log('[HistoricalDataController] analyzeHistoricalData is finished');
  }

  @Cron('0 17 * * 1-5') // Runs everyday at 5:00:00 PM from Monday to Friday
  async incrementalUpdateScheduler() {
    await this.incrementalUpdate();
  }

  @Put('full-update')
  async fullUpdate() {
    console.log('[HistoricalDataController] full update is started');
    const now = new Date();
    const today = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const lastYear = year - 1;
    const startDate = `${lastYear}-${month}-${today}`;
    const endDate = `${year}-${month}-${today}`;

    // get all tickers
    this.updateHistoricalData({ startDate, endDate });

    return {
      message: 'Full update historical data',
      status: 'success',
    };
  }

  @Put('incremental-update')
  async incrementalUpdate() {
    console.log('[HistoricalDataController] incremental update is started');
    const now = new Date();
    const today = now.getDate();
    const yesterday = today - 1;
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const startDate = `${year}-${month}-${yesterday}`;
    const endDate = `${year}-${month}-${today}`;

    // get all tickers
    this.updateHistoricalData({ startDate, endDate });

    return {
      message: 'Incremental update historical data',
      status: 'success',
    };
  }

  @Post('backfill')
  async backFill(@Body() { startDate, endDate }: { startDate: string; endDate: string }) {
    this.updateHistoricalData({ startDate, endDate });

    return {
      message: 'Backfill historical data',
      status: 'success',
    };
  }

  @Post('backfill-by-ticker')
  async backFillByTicker(@Body() { startDate, endDate, ticker }: { startDate: string; endDate: string, ticker: string }) {
    this.updateHistoricalDataByTicker({ startDate, endDate, ticker });

    return {
      message: 'Backfill historical data by ticker named ' + ticker,
      status: 'success',
    };
  }

  private async updateHistoricalData({
    startDate,
    endDate,
  }: {
    startDate: string;
    endDate: string;
  }) {
    try {
      console.log('[HistoricalDataController] updateHistoricalData is started with date range', { startDate, endDate });
      const marketTables = Object.values(marketCodeTableNameMap);
      for (const table of marketTables) {
        const tickers = this.stockRepository.getMarketDataByTableName(table);
        for await (const ticker of tickers) {
          await this.updateHistoricalDataByTicker({
            ticker: ticker.code,
            startDate,
            endDate,
          });
        }
      }
    } catch (err) {
      console.error('[HistoricalDataController] updateHistoricalData', err);
    } finally {
      console.log(
        '[HistoricalDataController] updateHistoricalData is finished',
      );
    }
  }

  private async updateHistoricalDataByTicker({
    ticker,
    startDate,
    endDate,
  }: {
    ticker: string;
    startDate: string;
    endDate: string;
  }) {
    try {
      const limit = 50;
      let offset = 0;
      let hasMore = true;
      while (hasMore) {
        const data = await this.fireAntService.getHistoricalDataByTimerange({
          ticker,
          startDate,
          endDate,
          limit,
          offset,
        });

        if (!data || data.length === 0) {
          hasMore = false;
        }
        offset += limit;
        await this.stockRepository.bulkInsert(
          'historicalData',
          this.formatHistoricalData(data),
        );
      }
    } catch (err) {
      console.error(
        '[HistoricalDataController] updateHistoricalDataByTicker',
        err,
      );
    }
  }

  private formatHistoricalData(data: TickerHistorical[]) {
    try {
      return data.map(item => ({
        ...item,
        date: item.date,
        currentForeignRoom: BigInt(item.currentForeignRoom),
        totalValue: BigInt(item.totalValue),
        buyForeignQuantity: BigInt(item.buyForeignQuantity),
        sellForeignQuantity: BigInt(item.sellForeignQuantity),
        buyCount: BigInt(item.buyCount),
        buyQuantity: BigInt(item.buyQuantity),
        sellCount: BigInt(item.sellCount),
        sellQuantity: BigInt(item.sellQuantity),
      }));
    } catch (err) {
      console.error('[HistoricalDataController] formatHistoricalData error', {
        error: err,
        data: data,
      });
    }
  }
}
