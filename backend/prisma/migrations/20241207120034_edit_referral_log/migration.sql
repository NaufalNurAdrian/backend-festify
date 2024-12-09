/*
  Warnings:

  - You are about to drop the column `user_id` on the `ReferralLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReferralLog" DROP CONSTRAINT "ReferralLog_user_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_referredBy_id_fkey";

-- AlterTable
ALTER TABLE "ReferralLog" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referral_id" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "ReferralLog"("referral_id") ON DELETE RESTRICT ON UPDATE CASCADE;
