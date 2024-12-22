import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomLogger } from './infra/logging/custom.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });


  const port = process.env.EXPOSE_PORT || 3002;
  await app.listen(port);
  console.log(`Listening on port ${port}`);
}
bootstrap();
