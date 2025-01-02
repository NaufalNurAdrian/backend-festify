/*
  Warnings:

  - You are about to alter the column `discountAmount` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "discountAmount" DROP DEFAULT,
ALTER COLUMN "discountAmount" SET DATA TYPE INTEGER;
