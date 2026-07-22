-- RenameTableColumns
ALTER TABLE "Events" RENAME COLUMN "status" TO "moderationStatus";
ALTER TABLE "Events" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'OPEN';

ALTER TABLE "Opportunity" RENAME COLUMN "status" TO "moderationStatus";
ALTER TABLE "Opportunity" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'open';
