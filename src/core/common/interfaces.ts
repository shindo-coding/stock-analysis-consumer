import { WatchlistTableName } from "src/data/stock/types";

export interface AnalysisResult {
  isGoodBuyingPoint: boolean;
  reasons: string[];
  riskLevel: 'low' | 'medium' | 'high';
  price?: number;
  volume?: number;
  totalDealValue?: number;
}

export interface WatchlistNoticationMessagePayload {
  type: WatchlistTableName;
}
