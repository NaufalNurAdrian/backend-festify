/*
  Warnings:

  - Added the required column `expiresAt` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `ReferralLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ReferralLog" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
