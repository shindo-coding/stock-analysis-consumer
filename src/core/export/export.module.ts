import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';

// Custom BigInt serializer
// @ts-ignore
BigInt.prototype.toJSON = function() {
  return this.toString();
};

@Module({
	controllers: [ExportController],
	providers: [ExportService],
	exports: [],
})
export class ExportModule {}
