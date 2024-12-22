/*
  Warnings:

  - Added the required column `priceBasic` to the `HistoricalData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `HistoricalData` ADD COLUMN `priceBasic` DOUBLE NOT NULL;
