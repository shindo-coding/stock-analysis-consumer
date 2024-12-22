-- AlterTable
ALTER TABLE `PriceWatchlistNotificationRealtime` ADD COLUMN `riskLevel` VARCHAR(191) NULL DEFAULT '';

-- AlterTable
ALTER TABLE `VolumeWatchlistNotificationDaily` ADD COLUMN `riskLevel` VARCHAR(191) NULL DEFAULT '';

-- AlterTable
ALTER TABLE `VolumeWatchlistNotificationRealtime` ADD COLUMN `riskLevel` VARCHAR(191) NULL DEFAULT '';
