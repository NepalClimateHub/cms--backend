-- Contact info (email, phones) lives on User; Organizations links via User.organizationId.
-- Backfill link from legacy org email before dropping columns.

UPDATE "User" u
SET "organizationId" = sub."orgId"
FROM (
  SELECT DISTINCT ON (LOWER(TRIM(o.email)))
    LOWER(TRIM(o.email)) AS norm_email,
    o.id AS "orgId"
  FROM "Organizations" o
  WHERE o."deletedAt" IS NULL
    AND o.email IS NOT NULL
    AND TRIM(o.email) <> ''
  ORDER BY LOWER(TRIM(o.email)), o."createdAt" ASC
) sub
WHERE u."organizationId" IS NULL
  AND u."deletedAt" IS NULL
  AND LOWER(TRIM(u.email)) = sub.norm_email;

ALTER TABLE "Organizations" DROP COLUMN IF EXISTS "email";
ALTER TABLE "Organizations" DROP COLUMN IF EXISTS "phoneCountryCode";
ALTER TABLE "Organizations" DROP COLUMN IF EXISTS "phoneNumber";
