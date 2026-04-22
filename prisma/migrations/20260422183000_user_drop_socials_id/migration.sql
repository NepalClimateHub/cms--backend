-- Drop legacy User.socialsId (social links live in User.socials JSON; FK was removed earlier).
ALTER TABLE "User" DROP COLUMN IF EXISTS "socialsId";

-- Link org account holders to the same address row as their organization when still null.
UPDATE "User" u
SET "addressId" = o."addressId"
FROM "Organizations" o
WHERE u."organizationId" = o."id"
  AND o."addressId" IS NOT NULL
  AND u."addressId" IS NULL;
