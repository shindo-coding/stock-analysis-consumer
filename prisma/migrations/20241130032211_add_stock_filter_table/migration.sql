-- CreateTable
CREATE TABLE `StockFilter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `marketCap` INTEGER NOT NULL,
    `pe` DOUBLE NOT NULL,
    `eps` DOUBLE NOT NULL,
    `beta` DOUBLE NOT NULL,
    `avgVolume10d` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
