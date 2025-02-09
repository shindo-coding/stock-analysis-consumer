import { Controller, Get, Logger } from '@nestjs/common';
import { VietLottService } from 'src/data/stock/vietlott.service';

@Controller('vietlott')
export class VietLottController {
	logger: Logger = new Logger(VietLottController.name);

	constructor(
		private readonly vietlottService: VietLottService,
	) {}

	@Get()
	async getAwardNumbers() {
		const awardNumbers = await this.vietlottService.getAwardNumbers();
		return awardNumbers;
	}
}
