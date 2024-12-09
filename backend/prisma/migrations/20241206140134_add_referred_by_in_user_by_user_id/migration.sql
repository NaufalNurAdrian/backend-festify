/*
  Warnings:

  - You are about to drop the column `referredBy` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "referredBy",
ADD COLUMN     "referredBy_id" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredBy_id_fkey" FOREIGN KEY ("referredBy_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
