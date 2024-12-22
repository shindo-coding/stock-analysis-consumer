import { Injectable } from '@nestjs/common';
import { BaseService } from '../base-service';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  WatchlistNotification,
  WatchlistTableName,
} from 'src/data/stock/types';
import { formatStockWatchlistMessage } from 'src/util/notification';

@Injectable()
export class NotifyConsumer extends BaseService {
  constructor() {
    super(NotifyConsumer.name);
  }

  @RabbitSubscribe({
    exchange: 'events',
    queue: 'stock-analysis-notification',
    routingKey: ['stock-analysis.notify'],
    queueOptions: { durable: true },
    errorHandler: (err, msg) => {
      console.error(err, msg);
    },
  })
  public async consume(msg: { type: WatchlistTableName }) {
    this.logger.verbose(`Received message: ${msg.type}`);
    const tableName = msg.type;
    if (!tableName) {
      return;
    }

    try {
      const limit = 50;
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
          result.map(item => item.code),
        );

        offset += limit;
      }
    } catch (error) {
      this.logger.error(error);
      return new Nack(true);
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
