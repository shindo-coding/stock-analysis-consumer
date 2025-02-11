import { Injectable } from '@nestjs/common';
import { Pushover } from 'pushover-js';
import { logMessage } from '../logging/custom.logger';

type Priority = -2 | -1 | 0 | 1 | 2;
type Sound =
	| 'pushover'
	| 'bike'
	| 'bugle'
	| 'cashregister'
	| 'classical'
	| 'cosmic'
	| 'falling'
	| 'gamelan'
	| 'incoming'
	| 'intermission'
	| 'magic'
	| 'mechanical'
	| 'pianobar'
	| 'siren'
	| 'spacealarm'
	| 'tugboat'
	| 'alien'
	| 'climb'
	| 'persistent'
	| 'echo'
	| 'updown'
	| 'vibrate'
	| 'none';

type AppName = 'VolumeAnalysis' | 'PriceAnalysis' | 'GoodInvestorAnalysis';

@Injectable()
export class PushoverNotification {
	private volumeAnalysisNotifier: Pushover;
	private priceAnalysisNotifier: Pushover;
	private goodInvestorAnalysisNotifier: Pushover;

	constructor() {
		const user = process.env.PUSHOVER_USER;
		const volumePushoverToken = process.env.VOLUME_PUSHOVER_TOKEN;
		const pricePushoverToken = process.env.PRICE_PUSHOVER_TOKEN;
		const goodInvestorPushoverToken = process.env.GOOD_INVESTOR_PUSHOVER_TOKEN;
		this.volumeAnalysisNotifier = new Pushover(user, volumePushoverToken);
		this.priceAnalysisNotifier = new Pushover(user, pricePushoverToken);
		this.goodInvestorAnalysisNotifier = new Pushover(
			user,
			goodInvestorPushoverToken,
		);
	}

	async send({
		appName,
		title,
		message,
		priority = 0,
		sound = 'bugle',
		html,
		url,
	}: {
		appName: AppName;
		title: string;
		message: string;
		priority?: Priority;
		sound?: Sound;
		html?: boolean;
		url?: { url: string; title: string };
	}) {
		try {
			const notifer = this.getClient(appName);
			notifer.setPriority(priority);
			notifer.setSound(sound);
			if (html) {
				notifer.setHtml();
			}
			if (url?.url && url?.title) {
				notifer.setUrl(url.url, url.title);
			}
			const response = await notifer.send(title, message);
			return response;
		} catch (error) {
			logMessage('error', error);
		}
	}

	private getClient(appName: AppName): Pushover {
		switch (appName) {
			case 'VolumeAnalysis':
				return this.volumeAnalysisNotifier;
			case 'PriceAnalysis':
				return this.priceAnalysisNotifier;
			case 'GoodInvestorAnalysis':
				return this.goodInvestorAnalysisNotifier;
			default:
				return undefined;
		}
	}
}

export default PushoverNotification;
