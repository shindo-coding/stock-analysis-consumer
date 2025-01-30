import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { UserPost } from './types';
import { removeDuplicates } from 'src/util/array';

@Injectable()
export class FireAntService {
	#baseUrl = 'https://restv2.fireant.vn';
	#jwtToken =
		'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSIsImtpZCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4iLCJhdWQiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4vcmVzb3VyY2VzIiwiZXhwIjoyMDMzNDU3MTgxLCJuYmYiOjE3MzM0NTcxODEsImNsaWVudF9pZCI6ImZpcmVhbnQud2ViIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsInJvbGVzIiwiZW1haWwiLCJhY2NvdW50cy1yZWFkIiwiYWNjb3VudHMtd3JpdGUiLCJvcmRlcnMtcmVhZCIsIm9yZGVycy13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiaW5kaXZpZHVhbHMtcmVhZCIsImZpbmFuY2UtcmVhZCIsInBvc3RzLXdyaXRlIiwicG9zdHMtcmVhZCIsInN5bWJvbHMtcmVhZCIsInVzZXItZGF0YS1yZWFkIiwidXNlci1kYXRhLXdyaXRlIiwidXNlcnMtcmVhZCIsInNlYXJjaCIsImFjYWRlbXktcmVhZCIsImFjYWRlbXktd3JpdGUiLCJibG9nLXJlYWQiLCJpbnZlc3RvcGVkaWEtcmVhZCJdLCJzdWIiOiJiNDQzZTBiZS1kYTI2LTQ4ZDMtOTRlYi03Zjg1YjcyMDgwOTMiLCJhdXRoX3RpbWUiOjE3MzM0NTcxODAsImlkcCI6Ikdvb2dsZSIsIm5hbWUiOiJ0aGFpc29ubGFtc3BAZ21haWwuY29tIiwic2VjdXJpdHlfc3RhbXAiOiJjYTgzYTAyYS1hODAxLTRjZGMtYWQxMS1jNjM1ZDI4ZDBhNWYiLCJqdGkiOiI1ZWYwMmRhZjAwZjViM2E2MjVkNzZhZDdiMWY1ZjBhZCIsImFtciI6WyJleHRlcm5hbCJdfQ.nPDM1NKaj4tgKlqxTwPSSlio52QzI61UgzV6vumWI_eoQqZhfFQc6VrhhUuHRLtYITIXTY7ti2GNYm_dzHJVh8eY8FN4a7i5LN8CEs4XqY8doIXToNkEl2bgjaKu4R3kVKnbrIzRPCaJHeJDeyS7_xX0J5c2AyiYI1WNGhVvHz0nrPh7onDlRiQtYZ0jLP4A-6irR7HnUKTSdH7qWQC8Xe9ECOTsmL5JbtXmNena5CletoR1e5qOrCN6XWOtT8DQqfN0OHfh_SDr7cciV-k-r1fLlEkf6DwG5U-ytZqrSXJJyww-_s7U0iPj3IDne1yPQIkAo7OqilLgxgPrezhBJQ';
	#logger = new Logger(FireAntService.name);

	constructor(private readonly httpService: HttpService) {}

	async getTickerSuggestionsByUser(userId: string): Promise<string[]> {
		const limit = 100;
		let offset = 0;
		const URL = `${this.#baseUrl}/posts?userId=${userId}&type=0&offset=${offset}&limit=${limit}`;

		try {
			const res = this.httpService.get(URL, {
				headers: {
					Authorization: 'Bearer ' + this.#jwtToken,
				},
			});
			const { data } = await firstValueFrom(res);
			const allPosts = data as UserPost[];

			let tickers = allPosts.map((post) =>
				post.taggedSymbols.map((item) => item.symbol),
			);
			tickers = tickers.filter((ticker) => ticker.length > 3);

			return removeDuplicates(tickers.flat());
		} catch (err) {
			this.#logger.error(err);
		}
	}

	private async getPostIdsByTicker(ticker: string) {
		// https://restv2.fireant.vn/posts?symbol=SAS&type=1&offset=0&limit=30
		const limit = 100;
		let offset = 0;
		const URL = `${this.#baseUrl}/posts?symbol=${ticker.toUpperCase()}&type=0&offset=${offset}&limit=${limit}`;

		try {
			const res = this.httpService.get(URL, {
				headers: {
					Authorization: 'Bearer ' + this.#jwtToken,
				},
			});
			const { data } = await firstValueFrom(res);
			const allPosts = (data as UserPost[]) || [];

			return allPosts.map((post) => post.postID);
		} catch (err) {
			this.#logger.error(err);
		}
	}

	async getTickerSuggestionsByPostComment(
		tickers: string[],
	): Promise<string[]> {
		const user = {
			id: 'F66E6BCA-E510-4E25-8AC3-911FDA769B8B', // Tuấn GVIN
		};
		const tickerSuggestions: string[] = [];

		for (const ticker of tickers) {
			const postIds = await this.getPostIdsByTicker(ticker);
			const limit = 100;
			let offset = 0;

			try {
				for (const postId of postIds) {
					const URL = `${this.#baseUrl}/posts/${postId}/replies?offset=${offset}&limit=${limit}`;
					const res = this.httpService.get(URL, {
						headers: {
							Authorization: 'Bearer ' + this.#jwtToken,
						},
					});
					const { data } = await firstValueFrom(res);
					const allPosts = data as UserPost[];

					// Find a reply from user
					const isUserCommented = allPosts.some(
						(post) => post.user.id === user.id,
					);
					console.log('isUserCommented', isUserCommented, ticker);
					if (isUserCommented) {
						tickerSuggestions.push(ticker);
						break;
					}
				}
			} catch (err) {
				this.#logger.error(err);
			}
		}

		return tickerSuggestions;
	}
}
