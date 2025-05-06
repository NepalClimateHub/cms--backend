-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "News" ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Organizations" ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT true;
