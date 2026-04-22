-- Move admin verification from Organizations to the linked User (organization account holder).

-- Ensure column exists on User (was removed in a prior migration; safe if already present)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isVerifiedByAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Backfill from organization rows before dropping
UPDATE "User" u
SET "isVerifiedByAdmin" = o."isVerifiedByAdmin"
FROM "Organizations" o
WHERE u."organizationId" = o.id
  AND o."isVerifiedByAdmin" IS NOT NULL;

ALTER TABLE "Organizations" DROP COLUMN IF EXISTS "isVerifiedByAdmin";
