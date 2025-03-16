import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { HttpModule } from '@nestjs/axios';
import PushoverNotification from './notification/pushover';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';

@Global()
@Module({
	controllers: [HealthController],
	imports: [
		PrismaModule,
		HttpModule.register({
			timeout: 10000,
		}),
		RabbitMqModule,
	],
	providers: [PrismaModule, PushoverNotification],
	exports: [PrismaModule, PushoverNotification, RabbitMqModule],
})
export class InfraModule {}
