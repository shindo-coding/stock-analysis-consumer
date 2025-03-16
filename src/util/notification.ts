import {
	PostCommentTickerSuggestion,
	WatchlistNotification,
	WatchlistTableName,
} from 'src/data/stock/types';

export function formatStockWatchlistMessage(
	type: WatchlistTableName,
	data: WatchlistNotification[],
) {
	const title = generateStockWatchlistMessageTitle(type);
	const messages = data.map((item) => {
		const formatedPrice = new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(item.price);
		const formatedTotalDealValue = new Intl.NumberFormat('vi-VN').format(
			item.totalDealValue,
		);
		return `<li><span style="color:green";>Code: ${item.code} || Price: ${formatedPrice} || Volume: ${item.volume} || Deal value: ${formatedTotalDealValue} || Risk level: ${item.riskLevel}</li>`;
	});
	return {
		title,
		message: `Stocks with abnormal price: <ul>${messages.join('')}</ul>`,
	};
}

export function formatTickerSuggestionMessage(
	suggestions: PostCommentTickerSuggestion[],
) {
	const title = 'Ticker suggestions from good investors';

	const homePageSuggestions: PostCommentTickerSuggestion[] = [];
	const postCommentSuggestions: PostCommentTickerSuggestion[] = [];

	for (const suggestion of suggestions) {
		if (suggestion.postType === 'user_homepage') {
			homePageSuggestions.push(suggestion);
		} else {
			postCommentSuggestions.push(suggestion);
		}
	}

	const homePageMessages = generateHomePageMessages(homePageSuggestions);
	const postCommentMessages = generatePostCommentMessages(
		postCommentSuggestions,
	);

	const messages = [homePageMessages, postCommentMessages].join('\n');
	return {
		title,
		message: `<div>${messages}</ul>`,
	};
}

function generateHomePageMessages(
	suggestions: PostCommentTickerSuggestion[],
): string {
	if (suggestions.length === 0) {
		return '';
	}
	const homePageUrl = 'https://fireant.vn/thanh-vien';
	const { userId, userName } = suggestions[0];

	return (
		`<p>Home page suggestions: <a href="${homePageUrl}/${userId}">${userName}</a></p>` +
		'<ul>' +
		suggestions
			.map((item) => {
				return `<li><span style="color:green";>${item.ticker}</span></li>`;
			})
			.join('') +
		'</ul>'
	);
}

function generatePostCommentMessages(
	suggestions: PostCommentTickerSuggestion[],
): string {
	if (suggestions.length === 0) {
		return '';
	}
	const basePostCommentUrl =
		'https://fireant.vn/bai-viet/5c3d4aca-bab7-402c-a712-1759e905b630';
	const { userName } = suggestions[0];

	return (
		`<p>${userName}'s post comment suggestions: </p>` +
		'<ul>' +
		suggestions
			.map((item) => {
				return `<li><a style="color:green" href="${basePostCommentUrl}/${item.postId}">${item.ticker}</a></li>`;
			})
			.join('') +
		'</ul>'
	);
}

function generateStockWatchlistMessageTitle(type: WatchlistTableName) {
	switch (type) {
		case 'PriceWatchlistNotificationRealtime':
			return '[Stock Analysis] Price Alert';
		case 'VolumeWatchlistNotificationDaily':
		case 'VolumeWatchlistNotificationRealtime':
			return '[Stock Analysis] Volume Alert';
		default:
			return '';
	}
}
