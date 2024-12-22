import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { InfraModule } from './infra/infra.module';
import { DataModule } from './data/data.module';

@Module({
  imports: [CoreModule, InfraModule, DataModule],
  controllers: [],
})
export class AppModule {}
