import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PostCommentTickerSuggestion, UserPost } from './types';
import { removeDuplicates } from 'src/util/array';

@Injectable()
export class FireAntService {
	#baseUrl = 'https://restv2.fireant.vn';
	#jwtToken =
		'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSIsImtpZCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4iLCJhdWQiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4vcmVzb3VyY2VzIiwiZXhwIjoyMDMzNDU3MTgxLCJuYmYiOjE3MzM0NTcxODEsImNsaWVudF9pZCI6ImZpcmVhbnQud2ViIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsInJvbGVzIiwiZW1haWwiLCJhY2NvdW50cy1yZWFkIiwiYWNjb3VudHMtd3JpdGUiLCJvcmRlcnMtcmVhZCIsIm9yZGVycy13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiaW5kaXZpZHVhbHMtcmVhZCIsImZpbmFuY2UtcmVhZCIsInBvc3RzLXdyaXRlIiwicG9zdHMtcmVhZCIsInN5bWJvbHMtcmVhZCIsInVzZXItZGF0YS1yZWFkIiwidXNlci1kYXRhLXdyaXRlIiwidXNlcnMtcmVhZCIsInNlYXJjaCIsImFjYWRlbXktcmVhZCIsImFjYWRlbXktd3JpdGUiLCJibG9nLXJlYWQiLCJpbnZlc3RvcGVkaWEtcmVhZCJdLCJzdWIiOiJiNDQzZTBiZS1kYTI2LTQ4ZDMtOTRlYi03Zjg1YjcyMDgwOTMiLCJhdXRoX3RpbWUiOjE3MzM0NTcxODAsImlkcCI6Ikdvb2dsZSIsIm5hbWUiOiJ0aGFpc29ubGFtc3BAZ21haWwuY29tIiwic2VjdXJpdHlfc3RhbXAiOiJjYTgzYTAyYS1hODAxLTRjZGMtYWQxMS1jNjM1ZDI4ZDBhNWYiLCJqdGkiOiI1ZWYwMmRhZjAwZjViM2E2MjVkNzZhZDdiMWY1ZjBhZCIsImFtciI6WyJleHRlcm5hbCJdfQ.nPDM1NKaj4tgKlqxTwPSSlio52QzI61UgzV6vumWI_eoQqZhfFQc6VrhhUuHRLtYITIXTY7ti2GNYm_dzHJVh8eY8FN4a7i5LN8CEs4XqY8doIXToNkEl2bgjaKu4R3kVKnbrIzRPCaJHeJDeyS7_xX0J5c2AyiYI1WNGhVvHz0nrPh7onDlRiQtYZ0jLP4A-6irR7HnUKTSdH7qWQC8Xe9ECOTsmL5JbtXmNena5CletoR1e5qOrCN6XWOtT8DQqfN0OHfh_SDr7cciV-k-r1fLlEkf6DwG5U-ytZqrSXJJyww-_s7U0iPj3IDne1yPQIkAo7OqilLgxgPrezhBJQ';
	#logger = new Logger(FireAntService.name);

	constructor(private readonly httpService: HttpService) {}

	async getTickerSuggestionsByUser(
		userId: string,
	): Promise<PostCommentTickerSuggestion[]> {
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

			let suggestions = allPosts.map((post) => {
				const tickers = removeDuplicates(
					post.taggedSymbols
						.filter((item) => item.symbol.length <= 3)
						.map((item) => item.symbol),
				);

				return tickers.map((ticker) => ({
					ticker,
					userId,
					postId: String(post.postID),
				}));
			});

			return suggestions.flat();
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
		userIds: string[],
	): Promise<PostCommentTickerSuggestion[]> {
		const postCommentTickerSuggestions: PostCommentTickerSuggestion[] = [];

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
					const allCommentPosts = data as UserPost[];

					// Find a reply from user
					const userCommentedPosts = this.findMatchingUsers(allCommentPosts, userIds);
					if (userCommentedPosts.length === 0) {
						continue;
					}
					userCommentedPosts.forEach(post => {
						postCommentTickerSuggestions.push({
							ticker,
							userId: post.user.id,
							postId: String(postId),
						});
					});
				}
			} catch (err) {
				this.#logger.error(err);
			}
		}

		return postCommentTickerSuggestions;
	}

	private findMatchingUsers(posts: UserPost[], userIds: string[]) {
		return posts.filter((post) => userIds.includes(post.user.id));
	}
}
