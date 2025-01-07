-- AlterTable
ALTER TABLE "OrderDetail" ADD COLUMN     "qrCode" TEXT NOT NULL DEFAULT 'https://backend-festify.vercel.app/api/users/usedticket',
ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false;
