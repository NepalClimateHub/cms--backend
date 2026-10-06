-- Opportunities share the events' OPEN / UPCOMING / CLOSED vocabulary.
-- Normalise legacy lowercase / free-text values, then cast the column to the enum.
UPDATE "Opportunity"
SET "status" = 'CLOSED'
WHERE UPPER(TRIM("status")) IN ('CLOSED', 'CLOSE');

UPDATE "Opportunity"
SET "status" = 'UPCOMING'
WHERE UPPER(TRIM("status")) = 'UPCOMING';

UPDATE "Opportunity"
SET "status" = 'OPEN'
WHERE "status" IS NULL OR "status" NOT IN ('OPEN', 'UPCOMING', 'CLOSED');

ALTER TABLE "Opportunity" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Opportunity" ALTER COLUMN "status" TYPE "EventStatus" USING "status"::"EventStatus";
ALTER TABLE "Opportunity" ALTER COLUMN "status" SET DEFAULT 'OPEN'::"EventStatus";
ALTER TABLE "Opportunity" ALTER COLUMN "status" SET NOT NULL;
