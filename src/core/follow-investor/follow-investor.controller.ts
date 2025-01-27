import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StockRepository } from 'src/data/stock/stock.repository';
import { FollowInvestorService } from './follow-investor.service';

@Controller('follow-investor')
export class FollowInvestorController {
	logger: Logger = new Logger(FollowInvestorController.name);

	constructor(
		private readonly stockRepository: StockRepository,
		private readonly followInvestorService: FollowInvestorService,
	) {
	}

	@Cron('0 */2 * * *') // Run every 2 hours
	async process() {
		this.logger.verbose(
			'Start getting ticker suggestions from good investors',
		);
		await this.getTickerSuggestions();
	}

	@Get()
	async getTickerSuggestions() {
		const userId = 'F66E6BCA-E510-4E25-8AC3-911FDA769B8B'; // Tuấn GVIN
		// Get ticker suggestions from user homepage

		const [tickerSuggestionsFromHomepage, tickerSuggestionsFromPostComment] =
			await Promise.all([
				this.followInvestorService.getTickerSuggestionsFromPostComment(),
				this.followInvestorService.getTickerSuggestionsFromPostComment(),
			]);
		const tickers = [
			...tickerSuggestionsFromHomepage,
			...tickerSuggestionsFromPostComment,
		];

		for (const ticker of tickers) {
			await this.stockRepository.insertTickerSuggestion(ticker, userId);
		}

		return tickers;
	}
}
