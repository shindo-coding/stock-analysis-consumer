import {
	PostCommentTickerSuggestion,
	WatchlistNotification,
	WatchlistTableName,
} from "src/data/stock/types";

export function formatStockWatchlistMessage(
	type: WatchlistTableName,
	data: WatchlistNotification[],
) {
	const title = generateStockWatchlistMessageTitle(type);
	const messages = data.map((item) => {
		const formatedPrice = new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(item.price);
		const formatedTotalDealValue = new Intl.NumberFormat("vi-VN").format(
			item.totalDealValue,
		);
		return `<li><span style="color:green";>Code: ${item.code} || Price: ${formatedPrice} || Volume: ${item.volume} || Deal value: ${formatedTotalDealValue} || Risk level: ${item.riskLevel}</li>`;
	});
	return {
		title,
		message: `Stocks with abnormal price: <ul>${messages.join("")}</ul>`,
	};
}

export function formatTickerSuggestionMessage(
	data: PostCommentTickerSuggestion[],
) {
	const title = "Ticker suggestions from good investors";
	const placeholderUrl =
		"https://fireant.vn/bai-viet/5c3d4aca-bab7-402c-a712-1759e905b630";

	const messages = data.map((item) => {
		const postLink = `${placeholderUrl}/${item.postId}`;
		return `<li><span style="color:green";>${item.ticker}: </span><a href='${postLink}'>Post link</a>`;
	});
	return {
		title,
		message: `<ul>${messages.join("")}</ul>`,
	};
}

function generateStockWatchlistMessageTitle(type: WatchlistTableName) {
	switch (type) {
		case "PriceWatchlistNotificationRealtime":
			return "[Stock Analysis] Price Alert";
		case "VolumeWatchlistNotificationDaily":
		case "VolumeWatchlistNotificationRealtime":
			return "[Stock Analysis] Volume Alert";
		default:
			return "";
	}
}
