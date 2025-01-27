export interface TickerDto {
  tradeDate: number;
  secCd: string;
  marketCd: number;
  updTime: number;
  secNo: number;
  secName: string;
  secType: number;
  status: string;
  openPrice: number;
  openQty: number;
  closePrice: number;
  closeQty: number;
  priorClosePrice: number;
  basicPrice: number;
  ceilingPrice: number;
  floorPrice: number;
  underlyingDirtyPrice: any;
  underlyingEndPrice: any;
  highestPrice: number;
  lowestPrice: number;
  avgPrice: number;
  projectOpen: number;
  projectQty: number;
  lastPrice: number;
  lastQty: number;
  priorPrice: number;
  priorQty: number;
  prePriorPrice: number;
  prePriorQty: number;
  totalQty: number;
  totalAmt: number;
  totalPtQty: any;
  totalPtAmt: any;
  best1BidPriceStr: string;
  best1BidPrice: number;
  best1BidQty: number;
  best2BidPrice: number;
  best2BidQty: number;
  best3BidPrice: number;
  best3BidQty: number;
  best4BidQty: number;
  best1OfferPriceStr: string;
  best1OfferPrice: number;
  best1OfferQty: number;
  best2OfferPrice: number;
  best2OfferQty: number;
  best3OfferPrice: number;
  best3OfferQty: number;
  best4OfferQty: number;
  totalRoom: number;
  beginRoom: number;
  currentRoom: number;
  sellForeignQty: number;
  buyForeignQty: number;
  totalOfferQty: number;
  totalBidQty: number;
  changePoint: number;
  changePercent: number;
  openInterest: number;
  openInterestChange: number;
  firstTradingDate: any;
  lastTradingDate: number;
  suspension: string;
  delisted: any;
  halted: string;
  split: any;
  benefit: string;
  meeting: any;
  notice: string;
  refStatus: any;
  basis: number;
  baseSecCd: any;
  issuer: any;
  execPrice: number;
  basePrice: number;
  basePriceCP: number;
  bfPrice: any;
  bbPrice: any;
  bcPrice: any;
  availSecDelivery: any;
  w52High: any;
  w52Low: any;
  secList: any;
  sessionCd: any;
  totalMatchedOfferQty: any;
  totalMatchedBidQty: any;
  totalOfferCount: any;
  totalBidCount: any;
  isSuser: any;
  listValueChange: any;
  stateObject: number;
}

export interface TickerHistorical {
  date: string;
  symbol: string;
  priceHigh: number;
  priceLow: number;
  priceOpen: number;
  priceAverage: number;
  priceClose: number;
  priceBasic: number;
  totalVolume: number;
  dealVolume: number;
  putthroughVolume: number;
  totalValue: number;
  putthroughValue: number;
  buyForeignQuantity: number;
  buyForeignValue: number;
  sellForeignQuantity: number;
  sellForeignValue: number;
  buyCount: number;
  buyQuantity: number;
  sellCount: number;
  sellQuantity: number;
  adjRatio: number;
  currentForeignRoom: number;
  propTradingNetDealValue: number;
  propTradingNetPTValue: number;
  propTradingNetValue: number;
  unit: number;
}

export interface TickerFundamental {
  symbol: any;
  companyType: number;
  sharesOutstanding: number;
  freeShares: number;
  beta: number;
  dividend: number;
  dividendYield: number;
  marketCap: string;
  low52Week: number;
  high52Week: number;
  priceChange1y: number;
  avgVolume10d: number;
  avgVolume3m: number;
  pe: number;
  eps: number;
  sales_TTM: number;
  netProfit_TTM: number;
  insiderOwnership: number;
  institutionOwnership: number;
  foreignOwnership: number;
}

export interface StockFilter {
  marketCap: string;
  pe: number;
  eps: number;
  beta: number;
  avgVolume10d: number;
}

export interface StockWatchlist {
  code: string;
  lowerPrice: number;
  upperPrice: number;
}

export interface StockWatchlistNotification {
  code: string;
  isSent: boolean;
  createdAt: Date;
}

export type Timetype = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

export interface StockDealDetail {
  Price: number;
  Vol: number;
  Package: number;
  TradingDateStr: string;
  Timetype: Timetype;
  Max?: number;
  Min?: number;
}

export type MarketName = 'HSX' | 'HNX' | 'UPCOM';

export type StockMarketTableName = 'HSXMarket' | 'upcomMarket' | 'hNXMarket';
export type WatchlistTableName =
  | 'VolumeWatchlistNotificationDaily'
  | 'VolumeWatchlistNotificationRealtime'
  | 'PriceWatchlistNotificationRealtime';
export type AllTableName = StockMarketTableName | 'historicalData';

export interface MarketStock {
  id: number;
  code: string;
  createdAt: Date;
}

export type Sort = 'asc' | 'desc';
export interface StockDealDetailOptions {
  timetype: Timetype;
  tradingDate: string;
  sort: Sort;
}

export interface WatchlistNotification {
  code: string;
  createdAt: Date;
  description: string;
  riskLevel: string;
}

export interface UserPost {
  postID: number
  userName: any
  user: User
  title: any
  description: any
  summary: any
  type: number
  newsType: any
  videoUrl: any
  videoThumbnailUrl: any
  videoWidth: any
  videoHeight: any
  language: string
  postGroup: any
  postSource: any
  isSourceContentFull: boolean
  postSourceUrl: any
  content: string
  originalContent: string
  date: string
  priority: number
  hasImage: boolean
  hasFile: boolean
  link: string
  linkImage: any
  linkTitle: any
  linkDescription: any
  sentiment: number
  approved: boolean
  isTop: boolean
  isExpertIdea: boolean
  liked: boolean
  totalLikes: number
  totalReplies: number
  totalShares: number
  replyToPostID: any
  referToPostID: any
  taggedSymbols: TaggedSymbol[]
  taggedIndividuals: any[]
  taggedHashTags: any[]
  taggedUsers: any[]
  files: any[]
  roomID: any
  roomName: any
  isRoomSticky: boolean
  videoType: any
  isVideo: boolean
  isEmagazine: boolean
  isInfographic: boolean
  lastRepliedDate: any
  isLivestream: boolean
  livestreamStarted: boolean
  livestreamEnded: boolean
  streamingUrl: any
  streamingKey: any
  youtubeStreamingUrl: any
  youtubeStreamingKey: any
  facebookStreamingUrl: any
  facebookStreamingKey: any
  livestreamAction: boolean
  livestreamActionTitle: any
  livestreamActionUrl: any
  livestreamActionRoute: any
  repliesDisabled: boolean
  repliesModerationRequired: boolean
  pendingApproval: boolean
}

export interface User {
  id: string
  name: string
  bio: any
  isAuthentic: boolean
  followed: boolean
}

export interface TaggedSymbol {
  symbol: string
  price: number
  change: number
  percentChange: number
  changeSince: number
  percentChangeSince: number
}
