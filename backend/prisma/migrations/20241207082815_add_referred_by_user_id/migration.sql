/*
  Warnings:

  - Added the required column `referred_id` to the `ReferralLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ReferralLog" DROP CONSTRAINT "ReferralLog_user_id_fkey";

-- AlterTable
ALTER TABLE "ReferralLog" ADD COLUMN     "referred_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ReferralLog" ADD CONSTRAINT "ReferralLog_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
