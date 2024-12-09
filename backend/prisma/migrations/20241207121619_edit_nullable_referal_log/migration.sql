/*
  Warnings:

  - You are about to drop the column `points` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_referral_id_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "points",
ALTER COLUMN "referral_id" DROP NOT NULL,
ALTER COLUMN "referral_id" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "ReferralLog"("referral_id") ON DELETE SET NULL ON UPDATE CASCADE;
