import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { HttpModule } from '@nestjs/axios';
import { Scheduler } from './scheduler';
import PushoverNotification from './notification/pushover';
import { ScheduleModule } from '@nestjs/schedule';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';

@Global()
@Module({
  controllers: [HealthController],
  imports: [PrismaModule, HttpModule, ScheduleModule.forRoot(), RabbitMqModule],
  providers: [Scheduler, PrismaModule, PushoverNotification],
  exports: [Scheduler, PrismaModule, PushoverNotification, RabbitMqModule],
})
export class InfraModule {}
