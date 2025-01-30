import { Injectable, Logger } from '@nestjs/common';
import { marketCodeTableNameMap } from 'src/constant/stock-market';
import { FireAntService } from 'src/data/stock/fireant.service';
import { StockRepository } from 'src/data/stock/stock.repository';

@Injectable()
export class FollowInvestorService {
	logger: Logger = new Logger(FollowInvestorService.name);

	constructor(
		private readonly stockRepository: StockRepository,
		private readonly fireantService: FireAntService,
	) {}

	async getTickerSuggestionsFromPostComment(): Promise<string[]> {
		try {
			const tickers = [];
			const marketTables = Object.values(marketCodeTableNameMap);
			for (const table of marketTables) {
				const codes = await this.stockRepository.getTickerByTableName(table);
				tickers.push(...codes);
			}

			return this.fireantService.getTickerSuggestionsByPostComment(tickers);
		} catch (error) {
			this.logger.error(error);
		}
	}

	async getTickerSuggestionsFromHomepage(): Promise<string[]> {
		try {
			const user = {
				id: 'F66E6BCA-E510-4E25-8AC3-911FDA769B8B', // Tuấn GVIN
			};
			const tickers = await this.fireantService.getTickerSuggestionsByUser(
				user.id,
			);
			this.logger.verbose(`Ticker suggestions: ${tickers}`);
			return tickers;
		} catch (err) {
			this.logger.error(err);
		}
	}
}
