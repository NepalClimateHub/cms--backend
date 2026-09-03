-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PublicationStatus') THEN
    CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EventStatus') THEN
    CREATE TYPE "EventStatus" AS ENUM ('OPEN', 'UPCOMING', 'CLOSED');
  END IF;
END $$;

-- AlterTable
ALTER TABLE "Events" ADD COLUMN IF NOT EXISTS "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT';

-- Migrate existing isDraft data to publicationStatus
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Events' AND column_name = 'isDraft'
  ) THEN
    UPDATE "Events"
    SET "publicationStatus" = CASE
      WHEN "isDraft" = false THEN 'PUBLISHED'::"PublicationStatus"
      ELSE 'DRAFT'::"PublicationStatus"
    END;

    ALTER TABLE "Events" DROP COLUMN "isDraft";
  END IF;
END $$;

-- Normalize existing status values and cast to EventStatus enum
UPDATE "Events"
SET "status" = 'CLOSED'
WHERE "status" = 'CLOSE' OR "status" = 'closed';

UPDATE "Events"
SET "status" = 'OPEN'
WHERE "status" IS NULL OR "status" NOT IN ('OPEN', 'UPCOMING', 'CLOSED');

ALTER TABLE "Events" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Events" ALTER COLUMN "status" TYPE "EventStatus" USING "status"::"EventStatus";
ALTER TABLE "Events" ALTER COLUMN "status" SET DEFAULT 'OPEN'::"EventStatus";
ALTER TABLE "Events" ALTER COLUMN "status" SET NOT NULL;
