/*
  Warnings:

  - You are about to alter the column `totalPrice` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "totalPrice" SET DATA TYPE INTEGER;
