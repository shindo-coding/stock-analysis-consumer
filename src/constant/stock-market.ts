import { MarketName, StockMarketTableName } from 'src/data/stock/types';

export const marketCodes: MarketName[] = ['HSX', 'HNX', 'UPCOM'];

export const marketCodeMap = {
  HSX: 100,
  HNX: 200,
  UPCOM: 300,
};

export const marketCodeTableNameMap: Record<string, StockMarketTableName> = {
  HSX: 'HSXMarket',
  HNX: 'hNXMarket',
  UPCOM: 'upcomMarket',
};
