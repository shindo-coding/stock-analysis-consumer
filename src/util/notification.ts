import {
  WatchlistNotification,
  WatchlistTableName,
} from 'src/data/stock/types';

export function formatStockWatchlistMessage(
  type: WatchlistTableName,
  data: WatchlistNotification[],
) {
  const title = generateStockWatchlistMessageTitle(type);
  const messages = data.map(item => {
    return `<li><span style="color:green";>${item.code}</span><ul><li>Description: ${item.description}</li><li>Risk level: ${item.riskLevel}</li></ul></li>`;
  });
  return {
    title,
    message: `Stocks with abnormal price: <ul>${messages.join('')}</ul>`,
  };
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
