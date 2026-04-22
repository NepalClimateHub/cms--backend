-- Step 1: Add new columns to User
ALTER TABLE "User" ADD COLUMN "bannerImageId" TEXT;
ALTER TABLE "User" ADD COLUMN "bannerImageUrl" TEXT;

-- Step 2: Migrate data from Organizations to User
-- Migrate banner data
UPDATE "User"
SET "bannerImageId" = o."bannerImageId",
    "bannerImageUrl" = o."bannerImageUrl"
FROM "Organizations" o
WHERE "User"."organizationId" = o.id;

-- Migrate logo data to profile photo fields
UPDATE "User"
SET "profilePhotoId" = o."logoImageId",
    "profilePhotoUrl" = o."logoImageUrl"
FROM "Organizations" o
WHERE "User"."organizationId" = o.id;

-- Migrate socials data
UPDATE "User"
SET "socials" = o."socials"
FROM "Organizations" o
WHERE "User"."organizationId" = o.id AND o."socials" IS NOT NULL;

-- Step 3: Remove old columns from Organizations
ALTER TABLE "Organizations" DROP COLUMN "bannerImageId";
ALTER TABLE "Organizations" DROP COLUMN "bannerImageUrl";
ALTER TABLE "Organizations" DROP COLUMN "logoImageId";
ALTER TABLE "Organizations" DROP COLUMN "logoImageUrl";
ALTER TABLE "Organizations" DROP COLUMN "socials";
ALTER TABLE "Organizations" DROP COLUMN "socialsId";
