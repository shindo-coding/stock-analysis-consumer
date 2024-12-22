import { Controller, Get } from '@nestjs/common';
import { StockRepository } from 'src/data/stock/stock.repository';
import { RabbitMqService } from '../rabbitmq/rabbitmq.service';

@Controller()
export class HealthController {
  constructor(
    private stockRepository: StockRepository,
    private rabbitMqService: RabbitMqService,
  ) {}

  @Get()
  getInfo() {
    return {
      service: 'stock-analysis',
      version: '1.0.0',
    };
  }

  @Get(['/healthz', 'livez'])
  async getStatus() {
    const [mysqlStatus, rabbitMqStatus] = await Promise.all([
      this.stockRepository.checkHealth(),
      this.rabbitMqService.checkHealth(),
    ]);

    if (!mysqlStatus) {
      throw new Error('MySQL is not healthy');
    }
    if (!rabbitMqStatus) {
      throw new Error('RabbitMQ is not healthy');
    }

    return {
      status: 'ok',
    };
  }
}
