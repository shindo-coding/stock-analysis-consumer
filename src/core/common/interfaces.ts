import { WatchlistTableName } from "src/data/stock/types";

export interface AnalysisResult {
  isGoodBuyingPoint: boolean;
  reasons: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface WatchlistNoticationMessagePayload {
  type: WatchlistTableName;
}
