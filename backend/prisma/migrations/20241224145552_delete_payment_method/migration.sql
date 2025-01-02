/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paymentMethod";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "paymentMethod";

-- DropEnum
DROP TYPE "PaymentMethod";
