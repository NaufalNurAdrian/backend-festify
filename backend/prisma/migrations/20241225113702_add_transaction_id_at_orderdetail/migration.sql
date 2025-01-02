-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_orderDetail_id_fkey";

-- AlterTable
ALTER TABLE "OrderDetail" ADD COLUMN     "transaction_id" INTEGER;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("transaction_id") ON DELETE SET NULL ON UPDATE CASCADE;
