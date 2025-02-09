import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { addDays, format } from 'date-fns';

@Injectable()
export class VietLottService {
	#baseUrl =
		'https://baomoi.com/_next/data/UZ_DOWp09iSNzivwhav7O/utilities/lottery/vietlott/power655.json';
	#logger = new Logger(VietLottService.name);

	constructor(private readonly httpService: HttpService) {}

	// 1 year of award numbers
	async getAwardNumbers(): Promise<string[]> {
		// Set start date as '01-02-2025'
		let currentDate = new Date('2024-01-01'); // Note: Using ISO format for Date constructor
		const today = new Date();
		const awardNumbers: string[] = [];

		while (currentDate <= today) {
			const formattedDate = format(currentDate, 'dd-MM-yyyy');
			const URL = `${this.#baseUrl}?date=${formattedDate}&slug=power655`;

			try {
				const res = this.httpService.get(URL);
				const { data } = await firstValueFrom(res);

				if (data.pageProps.resp.data?.content?.items) {
					const awardNumber =
						data.pageProps.resp.data.content.items[0].awards[0].value;
					awardNumbers.push(awardNumber);
				}

				currentDate = addDays(currentDate, 1);
			} catch (err) {
				this.#logger.error(err);
				currentDate = addDays(currentDate, 1); // Continue to next date even if error occurs
			}
		}

		return awardNumbers;
	}
}
