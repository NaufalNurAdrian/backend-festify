/*
  Warnings:

  - You are about to drop the column `referred_id` on the `ReferralLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReferralLog" DROP CONSTRAINT "ReferralLog_referred_id_fkey";

-- AlterTable
ALTER TABLE "ReferralLog" DROP COLUMN "referred_id";

-- AddForeignKey
ALTER TABLE "ReferralLog" ADD CONSTRAINT "ReferralLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
