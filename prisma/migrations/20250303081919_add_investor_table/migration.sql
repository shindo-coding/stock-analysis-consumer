-- AlterTable
ALTER TABLE `PriceWatchlistNotificationRealtime` ADD COLUMN `price` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `totalDealValue` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `volume` BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `VolumeWatchlistNotificationDaily` ADD COLUMN `price` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `totalDealValue` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `volume` BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `VolumeWatchlistNotificationRealtime` ADD COLUMN `price` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `totalDealValue` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `volume` BIGINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Investor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Investor_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `PriceWatchlistNotificationRealtime_code_isNotificationSent_c_idx` ON `PriceWatchlistNotificationRealtime`(`code`, `isNotificationSent`, `createdAt`);

-- CreateIndex
CREATE INDEX `VolumeWatchlistNotificationRealtime_code_isNotificationSent__idx` ON `VolumeWatchlistNotificationRealtime`(`code`, `isNotificationSent`, `createdAt`);
