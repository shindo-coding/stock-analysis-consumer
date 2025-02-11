import { Injectable } from '@nestjs/common';
import { BaseService } from '../base-service';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ConsumeMessage } from 'amqplib';
import {
    PostCommentTickerSuggestion,
	WatchlistNotification,
	WatchlistTableName,
} from 'src/data/stock/types';
import {
	formatStockWatchlistMessage,
	formatTickerSuggestionMessage,
} from 'src/util/notification';

@Injectable()
export class NotifyConsumer extends BaseService {
	constructor() {
		super(NotifyConsumer.name);
	}

	@RabbitSubscribe({
		exchange: 'events',
		queue: 'stock-analysis-notification',
		routingKey: ['stock-analysis.notify', 'stock-analysis.job.finished'],
		queueOptions: { durable: true },
		errorHandler: (err, msg) => {
			console.error('NotifyConsumer error', err, msg);
		},
	})
	public async consume(msg: any, amqpMsg: ConsumeMessage) {
		const routingKey = amqpMsg.fields.routingKey;
		switch (routingKey) {
			case 'stock-analysis.notify':
				return this.handleNotify(msg);
			case 'stock-analysis.job.finished':
				return this.handleJobFinished(msg);
			default:
				return;
		}
	}

	private async handleNotify(msg: any) {
		const tableName = msg.type;
		if (!tableName) {
			return;
		}

		try {
			const limit = 3;
			let offset = 0;
			while (true) {
				const result =
					await this.stockRepository.getStockWatchlistNotifications(
						tableName,
						offset,
						limit,
					);

				if (result.length === 0) {
					break;
				}

				await this.notify(tableName, result);
				await this.postProcess(
					tableName,
					result.map((item) => item.code),
				);

				offset += limit;
			}
		} catch (error) {
			this.logger.error(error);
			return new Nack(true);
		}
	}

	private async handleJobFinished(msg: any) {
		const tickerSuggestions = await this.stockRepository.getTickerSuggestions();
		// Create chunks of 7 ticker suggestions
		const chunkSize = 7;
		const chunks: Array<PostCommentTickerSuggestion[]> = [];
		for (let i = 0; i < tickerSuggestions.length; i += chunkSize) {
			chunks.push(tickerSuggestions.slice(i, i + chunkSize));
		}

		for (const chunk of chunks) {
			const { title, message } = formatTickerSuggestionMessage(chunk);
			await this.notificationService.send({
				title,
				message,
				html: true,
			});
			await this.postProcess(
				'TickerSuggestion',
				chunk.map((item) => item.ticker),
			);
		}
	}

	private async notify(
		tableName: WatchlistTableName,
		messages: WatchlistNotification[],
	) {
		const { title, message } = formatStockWatchlistMessage(tableName, messages);
		await this.notificationService.send({
			title,
			message,
			html: true,
		});
	}

	private async postProcess(tableName: WatchlistTableName, tickers: string[]) {
		await this.stockRepository.markStocksVolumeWatchlistAsNotified(
			tableName,
			tickers,
		);
	}
}
