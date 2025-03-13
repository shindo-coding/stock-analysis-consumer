import { Body, Controller, Get, Logger, Post } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { StockRepository } from "src/data/stock/stock.repository";
import { FollowInvestorService } from "./follow-investor.service";
import { RabbitMqService } from "src/infra/rabbitmq/rabbitmq.service";
import { Investor } from "src/data/stock/types";

@Controller("follow-investor")
export class FollowInvestorController {
	logger: Logger = new Logger(FollowInvestorController.name);
	private taskStatus: "not-started" | "running" | "finished" = "not-started";

	constructor(
		private readonly stockRepository: StockRepository,
		private readonly followInvestorService: FollowInvestorService,
		private readonly rabbitMqService: RabbitMqService,
	) {}

	// @Cron("0 5,12,23 * * *") // Run at 5:00, 12:00, 23:00 every day
	async process() {
		if (this.taskStatus === "running") {
			this.logger.verbose("Ticker suggestions job is running");
			return;
		}
		await this.getTickerSuggestions();
	}

	@Get("trigger")
	async trigger() {
		if (this.taskStatus === "running") {
			this.logger.verbose("Ticker suggestions job is running");
			return;
		}
		this.getTickerSuggestions();
	}

	@Get()
	async getTickerSuggestions() {
		this.taskStatus = "running";
		this.logger.verbose("Start getting ticker suggestions from good investors");
		const investors = await this.stockRepository.getInvestors();
		if (investors.length === 0) {
			return;
		}

		const userIds = investors.map((investor) => investor.userId);

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

		await this.rabbitMqService.publishMessage({
			message: { message: "Ticker suggestions job is finished" },
			routingKey: "stock-analysis.job.finished",
		});

		this.taskStatus = "finished";
		return suggestions;
	}

	@Post("investor")
	async addInvestor(@Body() { investors }: { investors: Investor[] }) {
		return this.stockRepository.insertInvestor(investors);
	}
}
