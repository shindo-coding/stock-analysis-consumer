import { Controller, Get, Logger, Param } from "@nestjs/common";
import { ExportService } from "./export.service";

@Controller("export")
export class ExportController {
	logger: Logger = new Logger(ExportController.name);

	constructor(
	  private readonly exportService: ExportService,
	) {}


  @Get('ticker-trading/:ticker')
  async exportTickerTrading(@Param('ticker') ticker: string) {
    try {
      return this.exportService.getAllHistoricalDataByTicker(ticker);
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }

  @Get('tickers')
  async exportTickers() {
    try {
      return this.exportService.getAllTickersCode();
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }
}
