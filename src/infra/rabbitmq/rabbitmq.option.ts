import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';

export const RabbitMqOptions: RabbitMQConfig = {
  uri: process.env.RABBITMQ_URL!,
  connectionInitOptions: { wait: false },
  prefetchCount: 50,
};
