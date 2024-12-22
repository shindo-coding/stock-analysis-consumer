import { Inject, Logger } from '@nestjs/common';
import { StockRepository } from 'src/data/stock/stock.repository';
import PushoverNotification from 'src/infra/notification/pushover';
import { RabbitMqService } from 'src/infra/rabbitmq/rabbitmq.service';

export abstract class BaseService {
  @Inject(StockRepository)
  protected stockRepository: StockRepository;

  @Inject(PushoverNotification)
  protected notificationService: PushoverNotification;

  @Inject(RabbitMqService)
  protected mqClient: RabbitMqService;

  protected logger: Logger;

  constructor(private serviceName: string) {
    this.logger = new Logger(serviceName);
  }
}
