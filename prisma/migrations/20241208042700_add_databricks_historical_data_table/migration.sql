-- CreateTable
CREATE TABLE `DatabricksHistoricalData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(191) NOT NULL,
    `lookbackDays` INTEGER NOT NULL,
    `isGoodBuyingPoint` BOOLEAN NOT NULL,
    `reasons` VARCHAR(191) NULL,
    `riskLevel` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
