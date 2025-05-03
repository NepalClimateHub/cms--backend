-- AlterTable
ALTER TABLE "Events" ALTER COLUMN "bannerImageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "News" ALTER COLUMN "bannerImageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Opportunity" ALTER COLUMN "bannerImageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Organizations" ALTER COLUMN "bannerImageUrl" DROP NOT NULL;
