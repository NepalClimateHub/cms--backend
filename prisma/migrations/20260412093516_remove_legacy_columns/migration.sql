-- Drop legacy columns (see commit message / PR for context)

ALTER TABLE "Organizations" DROP COLUMN IF EXISTS "isDraft";

ALTER TABLE "User" DROP COLUMN IF EXISTS "isVerifiedByAdmin";
