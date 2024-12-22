/*
  Warnings:

  - Added the required column `isNotificationSent` to the `VolumeWatchlistNotificationRealtime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `VolumeWatchlistNotificationRealtime` ADD COLUMN `isNotificationSent` BOOLEAN NOT NULL;
