import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
	PostCommentTickerSuggestion,
	TickerHistorical,
	TickerPost,
	UserPost,
	UserPostReply,
} from './types';
import { chunkArray, removeDuplicates } from 'src/util/array';
import { sub } from 'date-fns';
import { retryRequest } from 'src/util/request';
import { sleep } from 'src/util/time';

@Injectable()
export class FireAntService {
	baseUrl = 'https://restv2.fireant.vn';
	jwtToken =
		'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSIsImtpZCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4iLCJhdWQiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4vcmVzb3VyY2VzIiwiZXhwIjoxODg5NjIyNTMwLCJuYmYiOjE1ODk2MjI1MzAsImNsaWVudF9pZCI6ImZpcmVhbnQudHJhZGVzdGF0aW9uIiwic2NvcGUiOlsiYWNhZGVteS1yZWFkIiwiYWNhZGVteS13cml0ZSIsImFjY291bnRzLXJlYWQiLCJhY2NvdW50cy13cml0ZSIsImJsb2ctcmVhZCIsImNvbXBhbmllcy1yZWFkIiwiZmluYW5jZS1yZWFkIiwiaW5kaXZpZHVhbHMtcmVhZCIsImludmVzdG9wZWRpYS1yZWFkIiwib3JkZXJzLXJlYWQiLCJvcmRlcnMtd3JpdGUiLCJwb3N0cy1yZWFkIiwicG9zdHMtd3JpdGUiLCJzZWFyY2giLCJzeW1ib2xzLXJlYWQiLCJ1c2VyLWRhdGEtcmVhZCIsInVzZXItZGF0YS13cml0ZSIsInVzZXJzLXJlYWQiXSwianRpIjoiMjYxYTZhYWQ2MTQ5Njk1ZmJiYzcwODM5MjM0Njc1NWQifQ.dA5-HVzWv-BRfEiAd24uNBiBxASO-PAyWeWESovZm_hj4aXMAZA1-bWNZeXt88dqogo18AwpDQ-h6gefLPdZSFrG5umC1dVWaeYvUnGm62g4XS29fj6p01dhKNNqrsu5KrhnhdnKYVv9VdmbmqDfWR8wDgglk5cJFqalzq6dJWJInFQEPmUs9BW_Zs8tQDn-i5r4tYq2U8vCdqptXoM7YgPllXaPVDeccC9QNu2Xlp9WUvoROzoQXg25lFub1IYkTrM66gJ6t9fJRZToewCt495WNEOQFa_rwLCZ1QwzvL0iYkONHS_jZ0BOhBCdW9dWSawD6iF1SIQaFROvMDH1rg';
	logger = new Logger(FireAntService.name);
	client: HttpService;

	constructor(private readonly httpService: HttpService) {
		this.client = httpService;
		this.client.axiosRef.defaults.timeout = 300000;
		this.client.axiosRef.defaults.headers.common['Content-Type'] =
			'application/json';
		this.client.axiosRef.defaults.headers.common['User-Agent'] =
			'PostmanRuntime/7.43.0';

		this.client.axiosRef.defaults.headers.common['authorization'] =
			'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSIsImtpZCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4iLCJhdWQiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4vcmVzb3VyY2VzIiwiZXhwIjoxODg5NjIyNTMwLCJuYmYiOjE1ODk2MjI1MzAsImNsaWVudF9pZCI6ImZpcmVhbnQudHJhZGVzdGF0aW9uIiwic2NvcGUiOlsiYWNhZGVteS1yZWFkIiwiYWNhZGVteS13cml0ZSIsImFjY291bnRzLXJlYWQiLCJhY2NvdW50cy13cml0ZSIsImJsb2ctcmVhZCIsImNvbXBhbmllcy1yZWFkIiwiZmluYW5jZS1yZWFkIiwiaW5kaXZpZHVhbHMtcmVhZCIsImludmVzdG9wZWRpYS1yZWFkIiwib3JkZXJzLXJlYWQiLCJvcmRlcnMtd3JpdGUiLCJwb3N0cy1yZWFkIiwicG9zdHMtd3JpdGUiLCJzZWFyY2giLCJzeW1ib2xzLXJlYWQiLCJ1c2VyLWRhdGEtcmVhZCIsInVzZXItZGF0YS13cml0ZSIsInVzZXJzLXJlYWQiXSwianRpIjoiMjYxYTZhYWQ2MTQ5Njk1ZmJiYzcwODM5MjM0Njc1NWQifQ.dA5-HVzWv-BRfEiAd24uNBiBxASO-PAyWeWESovZm_hj4aXMAZA1-bWNZeXt88dqogo18AwpDQ-h6gefLPdZSFrG5umC1dVWaeYvUnGm62g4XS29fj6p01dhKNNqrsu5KrhnhdnKYVv9VdmbmqDfWR8wDgglk5cJFqalzq6dJWJInFQEPmUs9BW_Zs8tQDn-i5r4tYq2U8vCdqptXoM7YgPllXaPVDeccC9QNu2Xlp9WUvoROzoQXg25lFub1IYkTrM66gJ6t9fJRZToewCt495WNEOQFa_rwLCZ1QwzvL0iYkONHS_jZ0BOhBCdW9dWSawD6iF1SIQaFROvMDH1rg';
	}

	async getTickerSuggestionsByUser(
		userId: string,
	): Promise<PostCommentTickerSuggestion[]> {
		const limit = 100;
		let offset = 0;
		const URL = `${this.baseUrl}/posts?userId=${userId}&type=0&offset=${offset}&limit=${limit}`;

		return retryRequest(async () => {
			try {
				const { data } = await firstValueFrom(this.client.get(URL));
				const threeMonthsAgo = sub(new Date(), { months: 3 });
				const allPosts = (data as UserPost[]).filter((post) => {
					const postDate = new Date(post.date);
					return postDate >= threeMonthsAgo;
				});
				if (!allPosts || allPosts.length === 0) {
					return [];
				}

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
						postType: 'user_homepage',
					}));
				});

				return suggestions.flat();
			} catch (err) {
				if (err.response.status !== 403) {
					this.logger.error(
						'[Error] getTickerSuggestionsByUser ' + err.message,
						err.stack,
					);
					return [];
				}
				return [];
			}
		});
	}

	private async getPostsByTicker(ticker: string): Promise<TickerPost[]> {
		// https://restv2.fireant.vn/posts?symbol=SAS&type=0&offset=0&limit=30
		const limit = 100;
		let offset = 0;
		const URL = `${this.baseUrl}/posts?symbol=${ticker.toUpperCase()}&type=0&offset=${offset}&limit=${limit}`;

		return retryRequest(async () => {
			try {
				const { data } = await firstValueFrom(this.client.get(URL));
				const threeMonthsAgo = sub(new Date(), { months: 3 });
				const allPosts = (data as UserPost[]).filter((post) => {
					const postDate = new Date(post.date);
					return postDate >= threeMonthsAgo;
				});

				return allPosts.map((post) => ({
					postId: post.postID,
					userId: post.user.id,
					ticker,
				}));
			} catch (err) {
				if (err.status !== 403) {
					this.logger.error('[Error] getPostsByTicker ' + err.message, {
						ticker,
						trace: err.stack,
					});
				}
			}
		});
	}

	async getTickerSuggestionsByPostComment(
		tickers: string[],
		userIds: string[],
	): Promise<PostCommentTickerSuggestion[]> {
		// TODO: remove the performance tracking when the optimization is done
		console.time('getTickerSuggestionsByPostComment - Execution Time');
		try {
			const postCommentTickerSuggestions: PostCommentTickerSuggestion[] = [];

			// Process 10 tickers at a time
			const tickerChunks = chunkArray(tickers, 10);
			for (const chunk of tickerChunks) {
				const postsPromises = chunk.map((ticker) =>
					this.getPostsByTicker(ticker),
				);
				const posts: TickerPost[][] = await Promise.all(postsPromises);

				const postRepliesAsyncIterator = this.processPostRepliesFromPosts(
					posts.flat().filter((post) => !!post),
				);
				for await (const posts of postRepliesAsyncIterator) {
					const userCommentedPosts = this.findMatchingUsers(posts, userIds);

					if (userCommentedPosts.length === 0) {
						continue;
					}

					userCommentedPosts.forEach((post) => {
						postCommentTickerSuggestions.push({
							ticker: post.ticker,
							userId: post.userId,
							postId: String(post.postId),
							postType: 'user_postcomment',
						});
					});
				}

				sleep(1000); // Sleep for 1 second to avoid rate limiting
			}

			console.timeEnd('getTickerSuggestionsByPostComment - Execution Time');
			return postCommentTickerSuggestions;
		} catch (err) {
			if (err.response.status !== 403) {
				this.logger.error(
					'[Error] getTickerSuggestionsByPostComment ' + err.message,
					err.stack,
				);
			}
		}
	}

	private async *processPostRepliesFromPosts(
		posts: TickerPost[],
	): AsyncGenerator<UserPostReply[]> {
		try {
			const chunks = chunkArray(posts, 100);
			for (const chunk of chunks) {
				const postRepliesPromises = chunk
					.filter((post) => !!post)
					.map((post) => this.getPostReplies(post));
				const postRepliesReponse = await Promise.all(postRepliesPromises);
				const postReplies = postRepliesReponse
					.flat()
					.filter((reply) => !!reply);
				yield postReplies;
			}
		} catch (err) {
			this.logger.error(
				'[Error] *processPostRepliesFromPosts ' + err.message,
				err.stack,
			);
		}
	}

	async getPostReplies(post: TickerPost): Promise<UserPostReply[]> {
		const { postId, ticker } = post || {};
		if (!postId || !ticker) {
			console.debug('Invalid post:', post);
			return [];
		}

		const limit = 100;
		let offset = 0;

		const URL = `${this.baseUrl}/posts/${postId}/replies?offset=${offset}&limit=${limit}`;

		return retryRequest(async () => {
			try {
				const { data } = await firstValueFrom(this.client.get(URL));
				const threeMonthsAgo = sub(new Date(), { months: 3 });
				const allCommentPosts = (data as UserPost[])
					.filter((post) => {
						if (
							!post ||
							!post.date ||
							!post.user ||
							!post.user.id ||
							!post.postID
						) {
							console.log('Invalid post structure:', post);
							return false; // Filter out invalid entries
						}
						const postDate = new Date(post.date);
						return postDate >= threeMonthsAgo;
					})
					.map((post) => ({
						postId: post.postID,
						userId: post.user.id,
						content: post.content || '',
						date: post.date,
						ticker,
					}));

				return allCommentPosts;
			} catch (err) {
				if (err.status !== 403) {
					this.logger.error('[Error] getPostReplies ' + err.message, {
						postId,
						trace: err.stack,
					});
				}
			}
		});
	}

	private findMatchingUsers(posts: UserPostReply[], userIds: string[]) {
		try {
			return posts.filter((post) => userIds.includes(post.userId));
		} catch (err) {
			this.logger.error('[Error] findMatchingUsers ' + err.message, err.stack);
		}
	}

	async getHistoricalDataByTimerange({
		ticker,
		startDate,
		endDate,
		offset = 0,
		limit = 20,
	}: {
		ticker: string;
		startDate: string;
		endDate: string;
		offset?: number;
		limit?: number;
	}): Promise<TickerHistorical[]> {
		try {
			const code = ticker.toUpperCase();
			const queryParams = {
				startDate,
				endDate,
				offset: String(offset),
				limit: String(limit),
			};
			const searchParams = new URLSearchParams(queryParams).toString();
			const URL = `${this.baseUrl}/symbols/${code}/historical-quotes?${searchParams}`;
			const res = this.client.get(URL);
			const { data } = await firstValueFrom(res);
			return data;
		} catch (err) {
			this.logger.error(err);
		}
	}
}
