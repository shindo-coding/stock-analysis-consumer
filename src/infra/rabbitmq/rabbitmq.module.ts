import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { RabbitMqOptions } from './rabbitmq.option';
import { RabbitMqService } from './rabbitmq.service';

@Module({
  imports: [RabbitMQModule.forRoot(RabbitMqOptions)],
  providers: [RabbitMqService],
  exports: [RabbitMqService],
})
export class RabbitMqModule {}
