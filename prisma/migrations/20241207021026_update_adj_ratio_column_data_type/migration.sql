/*
  Warnings:

  - You are about to alter the column `adjRatio` on the `HistoricalData` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `HistoricalData` MODIFY `adjRatio` DOUBLE NOT NULL;
