/*
  Warnings:

  - Added the required column `lastOrder` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "lastOrder" TIMESTAMP(3) NOT NULL;
