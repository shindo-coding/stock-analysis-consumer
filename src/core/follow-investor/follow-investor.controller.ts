import { Controller, Get, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StockRepository } from 'src/data/stock/stock.repository';
import { FollowInvestorService } from './follow-investor.service';
import { RabbitMqService } from 'src/infra/rabbitmq/rabbitmq.service';

@Controller('follow-investor')
export class FollowInvestorController {
	logger: Logger = new Logger(FollowInvestorController.name);
	private taskStatus: 'not-started' | 'running' | 'finished' = 'not-started';

	constructor(
		private readonly stockRepository: StockRepository,
		private readonly followInvestorService: FollowInvestorService,
		private readonly rabbitMqService: RabbitMqService,
	) {}

	@Cron('0 5,12,23 * * *') // Run at 5:00, 12:00, 23:00 every day
	async process() {
		if (this.taskStatus === 'running') {
			this.logger.verbose('Ticker suggestions job is running');
			return;
		}
		this.taskStatus = 'running';
		this.logger.verbose('Start getting ticker suggestions from good investors');
		await this.getTickerSuggestions();
		await this.rabbitMqService.publishMessage({
			message: { message: 'Ticker suggestions job is finished' },
			routingKey: 'stock-analysis.job.finished',
		});
		this.taskStatus = 'finished';
	}

	@Get('debug')
	async debug() {
		if (this.taskStatus === 'running') {
			return {
				message: 'Ticker suggestions job is running',
			};
		}
		if (this.taskStatus === 'finished') {
			return {
				message: 'Ticker suggestions job is finished',
			};
		}
		this.getTickerSuggestions();
		return {
			message: 'Ticker suggestions job is running',
		};
	}

	@Get()
	async getTickerSuggestions() {
		const userIds = [
			'F66E6BCA-E510-4E25-8AC3-911FDA769B8B', // Tuấn GVIN
			'b2929b48-1710-42c2-ad15-a37cb80adce9', // Panda
		];

		const [tickerSuggestionsFromHomepage, tickerSuggestionsFromPostComment] =
			await Promise.all([
				this.followInvestorService.getTickerSuggestionsFromHomepage(userIds),
				this.followInvestorService.getTickerSuggestionsFromPostComment(userIds),
			]);
		const suggestions = [
			...tickerSuggestionsFromHomepage,
			...tickerSuggestionsFromPostComment,
		];

		for (const suggestion of suggestions) {
			const record = {
				userId: suggestion.userId,
				ticker: suggestion.ticker,
				postId: suggestion.postId,
			};
			await this.stockRepository.insertTickerSuggestion(record);
		}
		return suggestions;
	}
}
