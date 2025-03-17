import { Injectable } from '@nestjs/common';
import { HistoricalData } from '@prisma/client';
import { subDays } from 'date-fns';
import { StockRepository } from 'src/data/stock/stock.repository';
import { AnalysisResult } from '../common/interfaces';

@Injectable()
export class HistoricalDataAnalyzer {
  constructor(private readonly stockRepository: StockRepository) {}

  private generateDateQuery(lookbackDays: number): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    const startDate = subDays(now, lookbackDays);

    return {
      startDate,
      endDate: now,
    };
  }

  async analyze(
    ticker: string,
    lookbackDays: number = 5,
  ): Promise<AnalysisResult> {
    const { startDate, endDate } = this.generateDateQuery(lookbackDays);
    const historicalData = await this.stockRepository.getHistoricalDataByTicker(
      {
        ticker,
        startDate,
        endDate,
      },
    );

    const volumeTrend = this.checkVolumeTrend(historicalData);
    const priceTrend = this.checkPriceTrend(historicalData);
    const foreignInvestorTrend = this.checkForeignInvestorTrend(historicalData);

    const buySignals = [
      volumeTrend.isBullish,
      priceTrend.isBullish,
      foreignInvestorTrend.isBullish,
    ].filter(Boolean).length;

    return {
      isGoodBuyingPoint: buySignals >= 2,
      reasons: [
        ...volumeTrend.reasons,
        ...priceTrend.reasons,
        ...foreignInvestorTrend.reasons,
      ],
      riskLevel: buySignals >= 3 ? 'low' : buySignals >= 2 ? 'medium' : 'high',
      price: historicalData[0].priceClose,
      volume: historicalData[0].totalVolume,
      totalDealValue: historicalData[0].priceClose * historicalData[0].totalVolume,
    };
  }

  private checkVolumeTrend(data: HistoricalData[]) {
    const volumeChanges = data.map((d, i) =>
      i > 0 ? d.totalVolume / data[i - 1].totalVolume : 1,
    );
    const avgVolumeIncrease =
      volumeChanges.slice(1).reduce((a, b) => a + b, 0) /
      (volumeChanges.length - 1);

    return {
      isBullish: avgVolumeIncrease > 1.2,
      reasons: avgVolumeIncrease > 1.2 ? ['Volume trend is increasing'] : [],
    };
  }

  private checkPriceTrend(data: HistoricalData[]) {
    const priceChanges = data.map((d, i) =>
      i > 0
        ? (d.priceClose - data[i - 1].priceClose) / data[i - 1].priceClose
        : 0,
    );
    const avgPriceChange =
      priceChanges.slice(1).reduce((a, b) => a + b, 0) /
      (priceChanges.length - 1);

    return {
      isBullish: avgPriceChange < 0 && Math.abs(avgPriceChange) > 0.02,
      reasons:
        avgPriceChange < 0 && Math.abs(avgPriceChange) > 0.02
          ? ['Price is showing potential consolidation or correction']
          : [],
    };
  }

  private checkForeignInvestorTrend(data: HistoricalData[]) {
    const netForeignBuying = data.map(
      d => d.buyForeignQuantity - d.sellForeignQuantity,
    );

    if (netForeignBuying.length === 0) {
      return {
        isBullish: false,
        reasons: [],
      };
    }

    // TODO: Verify if the conversion to BigInt is correct
    const avgNetBuying =
      BigInt(netForeignBuying.reduce((a, b) => BigInt(a) + BigInt(b), BigInt(0))) / BigInt(netForeignBuying.length);

    return {
      isBullish: avgNetBuying > 0,
      reasons:
        avgNetBuying > 0
          ? ['Foreign investors showing net buying interest']
          : [],
    };
  }
}
