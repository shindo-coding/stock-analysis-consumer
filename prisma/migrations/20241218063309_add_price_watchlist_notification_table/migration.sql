-- CreateTable
CREATE TABLE `PriceWatchlistNotificationRealtime` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `code` VARCHAR(191) NOT NULL,
    `isNotificationSent` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `PriceWatchlistNotificationRealtime_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
