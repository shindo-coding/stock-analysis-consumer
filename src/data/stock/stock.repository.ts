import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import {
	AllTableName,
	Investor,
	MarketStock,
	PostCommentTickerSuggestion,
	StockMarketTableName,
	StockWatchlist,
	WatchlistNotification,
	WatchlistTableName,
} from './types';
import { pick } from 'src/util/object';
import { logMessage } from 'src/infra/logging/custom.logger';
import {
	HistoricalData,
	PrismaClient,
	StockFilter,
} from 'shindo-coding-typed-prisma-package';

type DuplicateStrategy = 'skip' | 'update' | 'error' | 'merge';

interface BulkInsertOptions<T> {
	batchSize?: number;
	duplicateStrategy?: DuplicateStrategy;
	uniqueFields?: (keyof T)[];
	updateFields?: (keyof T)[];
}

@Injectable()
export class StockRepository {
	#prisma: PrismaClient;

	constructor(private prisma: PrismaService) {
		this.#prisma = new PrismaClient();
	}

	async addStockToWatchlist({ code, lowerPrice, upperPrice }: StockWatchlist) {
		try {
			const result = await this.prisma.stockWatchlist.create({
				data: {
					code: code.toUpperCase(),
					lowerPrice,
					upperPrice,
				},
			});
			return result;
		} catch (error) {
			if (error.code === 'P2002') {
				throw new Error('Stock ticker name is already exists');
			} else {
				console.error('error');
			}
		}
	}

	async getStockWatchlist(): Promise<StockWatchlist[]> {
		return this.prisma.stockWatchlist.findMany();
	}

	async bulkInsert<T>(
		tableName: AllTableName,
		data: T[],
		options: BulkInsertOptions<T> = {},
	) {
		const {
			batchSize = 1000,
			duplicateStrategy = 'skip',
			uniqueFields = [],
			updateFields = [],
		} = options;

		try {
			const chunks = [];
			for (let i = 0; i < data.length; i += batchSize) {
				chunks.push(data.slice(i, i + batchSize));
			}

			console.log(
				`[StockRepository] Starting bulk insert of ${data.length} records with '${duplicateStrategy}' strategy to table '${tableName}'`,
			);

			const startTime = Date.now();
			const results = {
				inserted: 0,
				updated: 0,
				skipped: 0,
				errors: 0,
			};

			for (const [index, chunk] of chunks.entries()) {
				await this.#prisma.$transaction(async (tx) => {
					// Get the dynamic table from Prisma client
					const table = tx[tableName];

					switch (duplicateStrategy) {
						case 'skip':
							const skipResult = await table.createMany({
								data: chunk,
								skipDuplicates: true,
							});
							results.inserted += skipResult.count;
							results.skipped += chunk.length - skipResult.count;
							break;

						case 'update':
							for (const record of chunk) {
								const whereClause = uniqueFields.reduce(
									(acc, field) => ({
										...acc,
										[field]: record[field],
									}),
									{},
								);

								const updateData =
									updateFields.length > 0 ? pick(record, updateFields) : record;

								const result = await table.upsert({
									where: whereClause as any,
									create: record,
									update: updateData,
								});

								if (result.id) {
									results.updated += 1;
								} else {
									results.inserted += 1;
								}
							}
							break;

						case 'merge':
							for (const record of chunk) {
								const whereClause = uniqueFields.reduce(
									(acc, field) => ({
										...acc,
										[field]: record[field],
									}),
									{},
								);

								const existing = await table.findUnique({
									where: whereClause as any,
								});

								if (existing) {
									const mergedData = {
										...existing,
										...record,
										updatedAt: new Date(),
									};

									await table.update({
										where: whereClause as any,
										data: mergedData,
									});
									results.updated += 1;
								} else {
									await table.create({
										data: record,
									});
									results.inserted += 1;
								}
							}
							break;

						case 'error':
							try {
								const result = await table.createMany({
									data: chunk,
									skipDuplicates: false,
								});
								results.inserted += result.count;
							} catch (error) {
								if (error.code === 'P2002') {
									throw new Error(
										`Duplicate records found in chunk ${index + 1}`,
									);
								}
								throw error;
							}
							break;
					}
				});

				console.log(`Processed chunk ${index + 1}/${chunks.length}`);
			}

			const duration = Date.now() - startTime;
			console.log(`Operation completed in ${duration}ms`);

			return {
				success: true,
				duration,
				...results,
			};
		} catch (error) {
			console.error('Operation failed:', error);
			throw error;
		}
	}

	async *getMarketDataByTableName(
		table: StockMarketTableName,
	): AsyncGenerator<MarketStock> {
		const batchSize = 1000; // Adjust batch size based on your needs
		let cursor = undefined;
		const tbl = this.prisma[table];

		while (true) {
			const batch = await tbl.findMany({
				take: batchSize,
				skip: cursor ? 1 : 0,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: {
					id: 'asc',
				},
			});

			if (batch.length === 0) break;

			for (const item of batch) {
				yield item;
			}

			if (batch.length < batchSize) break;
			cursor = batch[batch.length - 1].id;
		}
	}

	async getStockFilter(): Promise<StockFilter> {
		const filters = await this.prisma.stockFilter.findMany();
		return filters[0];
	}

	async insertStockVolumeWatchlist(ticker: string) {
		try {
			const result = await this.prisma.volumeWatchlist.create({
				data: {
					code: ticker.toUpperCase(),
				},
			});
			return result;
		} catch (error) {
			if (error.code === 'P2002') {
				throw new Error('Stock ticker name is already exists');
			} else {
				console.error('error', error);
			}
		}
	}

	async *getStockVolumeWatchlist(): AsyncGenerator<{
		code: string;
	}> {
		const batchSize = 1000; // Adjust batch size based on your needs
		let cursor = undefined;

		while (true) {
			const batch = await this.prisma.volumeWatchlist.findMany({
				take: batchSize,
				skip: cursor ? 1 : 0,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: {
					id: 'asc',
				},
			});

			if (batch.length === 0) break;

			for (const item of batch) {
				yield item;
			}

			if (batch.length < batchSize) break;
			cursor = batch[batch.length - 1].id;
		}
	}

	async truncateTable(tableName: WatchlistTableName): Promise<boolean> {
		try {
			await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableName}`);
			return true;
		} catch (error) {
			console.error('Error truncating table:', error);
			return false;
		}
	}

	async getStockWatchlistNotifications(
		tableName: WatchlistTableName,
		offset: number = 0,
		limit: number = 20,
	): Promise<WatchlistNotification[]> {
		const table = this.prisma[tableName];
		const records = await table.findMany({
			where: {
				isNotificationSent: false,
				// Only get records that being inserted today
				createdAt: {
					gte: new Date(new Date().setHours(0, 0, 0, 0)),
				},
			},
			skip: offset,
			take: limit,
		});

		return records;
	}

	async markStocksVolumeWatchlistAsNotified(
		tableName: WatchlistTableName,
		tickers: string[],
	): Promise<void> {
		try {
			const table = this.prisma[tableName];
			await table.updateMany({
				where: {
					code: {
						in: tickers,
					},
				},
				data: {
					isNotificationSent: true,
				},
			});
		} catch (error) {
			logMessage('error', { message: error.message });
		}
	}

	async getHistoricalDataByTicker({
		ticker,
		startDate,
		endDate,
	}: {
		ticker: string;
		startDate: Date;
		endDate: Date;
	}): Promise<HistoricalData[]> {
		try {
			return this.prisma.historicalData.findMany({
				where: {
					symbol: ticker.toUpperCase(),
				},
			});
		} catch (err) {
			logMessage('error', {
				message: 'Error getHistoricalDataByTicker',
				error: err,
			});
		}
	}

	async insertAnalyzedHistoricalData(data: any) {
		try {
			return this.prisma.databricksHistoricalData.create({
				data,
			});
		} catch (error) {
			logMessage('error', { message: error.message });
		}
	}

	async checkHealth(): Promise<boolean> {
		const affectedRows = await this.prisma.$executeRawUnsafe('SELECT 1');
		if (affectedRows != 0) {
			return false;
		}

		return true;
	}

	async getTickerByTableName(table: StockMarketTableName): Promise<string[]> {
		const data = await this.prisma[table].findMany({
			select: {
				code: true,
			},
		});

		return data.map((item) => item.code);
	}

	async insertTickerSuggestions(suggestions: PostCommentTickerSuggestion[]) {
		if (suggestions.length === 0) {
			return;
		}
		try {
			const records = suggestions.map((suggestion) => ({
				code: suggestion.ticker.toUpperCase(),
				userId: suggestion.userId,
				postId: suggestion.postId,
				postType: suggestion.postType,
			}));
			const result = await this.prisma.tickerSuggestion.createMany({
				data: records,
			});
			return result;
		} catch (err) {
			logMessage('error', { message: `insertTickerSuggestions: ${err}` });
		}
	}

	async insertTickerSuggestion({
		ticker,
		userId,
		postId,
		postType,
	}: PostCommentTickerSuggestion) {
		try {
			const result = await this.prisma.tickerSuggestion.create({
				data: {
					code: ticker.toUpperCase(),
					userId,
					postId,
					postType,
				},
			});
			return result;
		} catch (err) {
			logMessage('error', { message: `insertTickerSuggestion: ${err}` });
		}
	}

	async findTickerSuggestions({
		userId,
	}: {
		userId: string;
	}): Promise<PostCommentTickerSuggestion[]> {
		try {
			const result = await this.#prisma.tickerSuggestion.findMany({
				include: {
					investor: true,
				},
				where: {
					isNotificationSent: false,
					userId,
				},
				distinct: ['code'],
				orderBy: {
					createdAt: 'desc',
				},
			});

			return result.map((item) => ({
				ticker: item.code,
				userId: item.userId,
				userName: item.investor.userName,
				postId: item.postId,
				postType: item.postType,
			}));
		} catch (err) {
			logMessage('error', {
				message: `findTickerSuggestionsByUser: ${err.message}`,
			});
		}
	}

	async getTickerSuggestions(): Promise<PostCommentTickerSuggestion[]> {
		try {
			const result = await this.prisma.tickerSuggestion.findMany({
				where: {
					isNotificationSent: false,
				},
			});
			return result.map((item) => ({
				ticker: item.code,
				userId: item.userId,
				postId: item.postId,
				postType: item.postType,
			}));
		} catch (err) {
			logMessage('error', { message: `getTickerSuggestions: ${err}` });
		}
	}

	async getInvestors(): Promise<Investor[]> {
		try {
			const rows = await this.prisma.investor.findMany();
			return rows.map((row) => ({
				userId: row.userId,
				userName: row.userName,
			}));
		} catch (err) {
			logMessage('error', { message: `[Error] getInvestors: ${err}` });
		}
	}

	async insertInvestor(investors: Investor[]) {
		try {
			const result = await this.prisma.investor.createMany({
				data: investors,
			});
			return result;
		} catch (err) {
			logMessage('error', { message: `[Error] insertInvestor: ${err}` });
		}
	}
}
