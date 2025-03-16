import { Body, Controller, Get, Logger, Post } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { StockRepository } from "src/data/stock/stock.repository";
import { FollowInvestorService } from "./follow-investor.service";
import { RabbitMqService } from "src/infra/rabbitmq/rabbitmq.service";
import { Investor } from "src/data/stock/types";

@Controller("follow-investor")
export class FollowInvestorController {
	logger: Logger = new Logger(FollowInvestorController.name);
	private taskStatus: "not-started" | "running" | "finished" | "failed" = "not-started";

	constructor(
		private readonly stockRepository: StockRepository,
		private readonly followInvestorService: FollowInvestorService,
		private readonly rabbitMqService: RabbitMqService,
	) {}

	@Cron("0 5,12 * * *") // Run at 5:00, 12:00, 23:00 every day
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
  try {
    this.taskStatus = "running";
    this.logger.verbose("Start getting ticker suggestions from good investors");

    const investors = await this.stockRepository.getInvestors();
    if (investors.length === 0) {
      this.logger.verbose("No investors found, skipping ticker suggestions");
      this.taskStatus = "finished";
      return "No investors to process";
    }

    const userIds = investors.map((investor) => investor.userId);

    // Process suggestions from homepage
    let tickerSuggestionsFromHomepage = [];
    let tickerSuggestionsFromPostComment = [];

    try {
      [tickerSuggestionsFromHomepage, tickerSuggestionsFromPostComment] = await Promise.all([
        this.followInvestorService.getTickerSuggestionsFromHomepage(userIds),
        this.followInvestorService.getTickerSuggestionsFromPostComment(userIds),
      ]);
    } catch (error) {
      this.logger.error("Error fetching ticker suggestions", error.stack);
      await this.rabbitMqService.publishMessage({
        message: { message: "Error fetching ticker suggestions", error: error.message },
        routingKey: "stock-analysis.job.error",
      });
    }

    // Process homepage suggestions
    if (!tickerSuggestionsFromHomepage?.length) {
      await this.rabbitMqService.publishMessage({
        message: { message: "No ticker suggestions found from user homepage" },
        routingKey: "stock-analysis.job.warning",
      });
    } else {
      await this.stockRepository.insertTickerSuggestions(tickerSuggestionsFromHomepage);
      this.logger.verbose(`Inserted ${tickerSuggestionsFromHomepage.length} ticker suggestions from homepage`);
    }

    // Process post comment suggestions
    if (!tickerSuggestionsFromPostComment?.length) {
      await this.rabbitMqService.publishMessage({
        message: { message: "No ticker suggestions found from user post comments" },
        routingKey: "stock-analysis.job.warning",
      });
    } else {
      await this.stockRepository.insertTickerSuggestions(tickerSuggestionsFromPostComment);
      this.logger.verbose(`Inserted ${tickerSuggestionsFromPostComment.length} ticker suggestions from post comments`);
    }

    // Report job completion
    await this.rabbitMqService.publishMessage({
      message: {
        message: "Ticker suggestions job is finished",
        stats: {
          homepageSuggestions: tickerSuggestionsFromHomepage?.length || 0,
          postCommentSuggestions: tickerSuggestionsFromPostComment?.length || 0
        }
      },
      routingKey: "stock-analysis.job.finished",
    });

    this.taskStatus = "finished";
    return 'Ticker suggestion job completed successfully';
  } catch (err) {
    this.logger.error("Ticker suggestion job failed", err.stack);
    this.taskStatus = "failed";

    await this.rabbitMqService.publishMessage({
      message: { message: "Ticker suggestion job failed", error: err.message },
      routingKey: "stock-analysis.job.error",
    }).catch(rmqErr => {
      this.logger.error("Failed to publish error message", rmqErr.stack);
    });

    return 'Ticker suggestion job failed';
  }
}

	@Post("investor")
	async addInvestor(@Body() { investors }: { investors: Investor[] }) {
		return this.stockRepository.insertInvestor(investors);
	}
}
