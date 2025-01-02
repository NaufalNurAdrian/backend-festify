/*
  Warnings:

  - The primary key for the `OrderDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `transaction_id` on the `OrderDetail` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderDetail" DROP CONSTRAINT "OrderDetail_transaction_id_fkey";

-- AlterTable
ALTER TABLE "OrderDetail" DROP CONSTRAINT "OrderDetail_pkey",
DROP COLUMN "transaction_id",
ALTER COLUMN "order_id" DROP DEFAULT,
ADD CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("order_id", "ticket_id");
DROP SEQUENCE "OrderDetail_order_id_seq";

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Transaction"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;
