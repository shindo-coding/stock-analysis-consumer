import { Global, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitMqService {
  #exchange = 'events';

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async checkHealth(): Promise<boolean> {
    return this.amqpConnection.managedConnection.isConnected();
  }

  async publishMessage({
    routingKey,
    message,
  }: {
    routingKey: string;
    message: any;
  }): Promise<boolean> {
    return this.amqpConnection.publish(this.#exchange, routingKey, message);
  }
}
