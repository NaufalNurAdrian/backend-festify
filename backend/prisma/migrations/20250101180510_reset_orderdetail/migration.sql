/*
  Warnings:

  - You are about to drop the `OrderDetail` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderDetail" DROP CONSTRAINT "OrderDetail_order_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderDetail" DROP CONSTRAINT "OrderDetail_ticket_id_fkey";

-- DropTable
DROP TABLE "OrderDetail";
