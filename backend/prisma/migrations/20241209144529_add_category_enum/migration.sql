/*
  Warnings:

  - Added the required column `category` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('MUSIC', 'FILM', 'SPORT', 'EDUCATION');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "category" "Category" NOT NULL;
