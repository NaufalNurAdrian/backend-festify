-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "thumbnail" DROP NOT NULL,
ALTER COLUMN "thumbnail" SET DEFAULT 'https://res.cloudinary.com/dxpeofir6/image/upload/v1734167683/eventdefault_fuvrcj.webp';
