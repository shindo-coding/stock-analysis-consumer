-- AlterTable
ALTER TABLE `PriceWatchlistNotificationRealtime` ADD COLUMN `description` VARCHAR(191) NULL DEFAULT '';

-- AlterTable
ALTER TABLE `VolumeWatchlistNotificationDaily` ADD COLUMN `description` VARCHAR(191) NULL DEFAULT '';

-- AlterTable
ALTER TABLE `VolumeWatchlistNotificationRealtime` ADD COLUMN `description` VARCHAR(191) NULL DEFAULT '';
