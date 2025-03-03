-- CreateTable
CREATE TABLE IF NOT EXISTS `StockWatchlist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `lowerPrice` DOUBLE NULL,
    `upperPrice` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `StockWatchlist_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `WatchlistNotification` (
    `code` VARCHAR(191) NOT NULL,
    `isSent` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WatchlistNotification_code_key`(`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `HSXMarket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `HSXMarket_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `UpcomMarket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UpcomMarket_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `HNXMarket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `HNXMarket_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `StockFilter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `marketCap` BIGINT NOT NULL,
    `pe` DOUBLE NOT NULL,
    `eps` DOUBLE NOT NULL,
    `beta` DOUBLE NOT NULL,
    `avgVolume10d` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `VolumeWatchlist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `code` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `VolumeWatchlist_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `VolumeWatchlistNotificationDaily` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `code` VARCHAR(191) NOT NULL,
    `price` BIGINT NOT NULL DEFAULT 0,
    `volume` BIGINT NOT NULL DEFAULT 0,
    `totalDealValue` BIGINT NOT NULL DEFAULT 0,
    `isNotificationSent` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(191) NULL DEFAULT '',
    `riskLevel` VARCHAR(191) NULL DEFAULT '',

    UNIQUE INDEX `VolumeWatchlistNotificationDaily_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `VolumeWatchlistNotificationRealtime` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `code` VARCHAR(191) NOT NULL,
    `price` BIGINT NOT NULL DEFAULT 0,
    `volume` BIGINT NOT NULL DEFAULT 0,
    `totalDealValue` BIGINT NOT NULL DEFAULT 0,
    `isNotificationSent` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(191) NULL DEFAULT '',
    `riskLevel` VARCHAR(191) NULL DEFAULT '',

    UNIQUE INDEX `VolumeWatchlistNotificationRealtime_code_key`(`code`),
    INDEX `VolumeWatchlistNotificationRealtime_code_isNotificationSent__idx`(`code`, `isNotificationSent`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `PriceWatchlistNotificationRealtime` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `code` VARCHAR(191) NOT NULL,
    `price` BIGINT NOT NULL DEFAULT 0,
    `volume` BIGINT NOT NULL DEFAULT 0,
    `totalDealValue` BIGINT NOT NULL DEFAULT 0,
    `isNotificationSent` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(191) NULL DEFAULT '',
    `riskLevel` VARCHAR(191) NULL DEFAULT '',

    UNIQUE INDEX `PriceWatchlistNotificationRealtime_code_key`(`code`),
    INDEX `PriceWatchlistNotificationRealtime_code_isNotificationSent_c_idx`(`code`, `isNotificationSent`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `HistoricalData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `totalVolume` INTEGER NOT NULL,
    `dealVolume` INTEGER NOT NULL,
    `putthroughVolume` INTEGER NOT NULL,
    `putthroughValue` INTEGER NOT NULL,
    `propTradingNetDealValue` INTEGER NOT NULL,
    `propTradingNetPTValue` INTEGER NOT NULL,
    `propTradingNetValue` INTEGER NOT NULL,
    `unit` INTEGER NOT NULL,
    `priceHigh` DOUBLE NOT NULL,
    `priceLow` DOUBLE NOT NULL,
    `priceOpen` DOUBLE NOT NULL,
    `priceAverage` DOUBLE NOT NULL,
    `priceClose` DOUBLE NOT NULL,
    `priceBasic` DOUBLE NOT NULL,
    `adjRatio` DOUBLE NOT NULL,
    `sellForeignValue` DOUBLE NOT NULL,
    `buyForeignValue` DOUBLE NOT NULL,
    `currentForeignRoom` BIGINT NOT NULL,
    `totalValue` BIGINT NOT NULL,
    `buyForeignQuantity` BIGINT NOT NULL,
    `sellForeignQuantity` BIGINT NOT NULL,
    `buyCount` BIGINT NOT NULL,
    `buyQuantity` BIGINT NOT NULL,
    `sellCount` BIGINT NOT NULL,
    `sellQuantity` BIGINT NOT NULL,

    INDEX `HistoricalData_symbol_idx`(`symbol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `DatabricksHistoricalData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `symbol` VARCHAR(191) NOT NULL,
    `lookbackDays` INTEGER NOT NULL,
    `isGoodBuyingPoint` BOOLEAN NOT NULL,
    `reasons` VARCHAR(191) NULL,
    `riskLevel` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Investor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Investor_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `TickerSuggestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isNotificationSent` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `TickerSuggestion_code_key`(`code`),
    INDEX `TickerSuggestion_code_userId_idx`(`code`, `userId`),
    UNIQUE INDEX `TickerSuggestion_code_postId_userId_key`(`code`, `postId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
