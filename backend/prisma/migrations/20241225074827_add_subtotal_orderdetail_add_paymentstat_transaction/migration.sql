/*
  Warnings:

  - You are about to drop the column `paymentStatus` on the `Payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_transaction_id_fkey";

-- AlterTable
ALTER TABLE "OrderDetail" ADD COLUMN     "subtotal" INTEGER;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paymentStatus";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
