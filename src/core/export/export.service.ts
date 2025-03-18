import { Injectable, Logger } from '@nestjs/common';
import { HistoricalData } from 'shindo-coding-typed-prisma-package';
import { StockRepository } from 'src/data/stock/stock.repository';
import { PostCommentTickerSuggestion } from 'src/data/stock/types';

@Injectable()
export class ExportService {
	logger: Logger = new Logger(ExportService.name);

	constructor(private readonly stockRepository: StockRepository) {}

	async getAllHistoricalDataByTicker(
		ticker: string,
	): Promise<HistoricalData[]> {
		try {
			const historicalData =
				await this.stockRepository.getAllHistoricalDataByTicker(ticker);
			return historicalData;
		} catch (error) {
			this.logger.error(error.message, error.stack);
		}
	}
}
