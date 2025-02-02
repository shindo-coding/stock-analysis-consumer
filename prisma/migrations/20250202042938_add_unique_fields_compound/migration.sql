/*
  Warnings:

  - A unique constraint covering the columns `[code,postId,userId]` on the table `TickerSuggestion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TickerSuggestion_code_postId_userId_key` ON `TickerSuggestion`(`code`, `postId`, `userId`);
