-- Ensure UserType has the required role values
DO $$ BEGIN
  ALTER TYPE "UserType" ADD VALUE IF NOT EXISTS 'ADMIN';
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE "UserType" ADD VALUE IF NOT EXISTS 'CONTENT_ADMIN';
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Ensure ContentStatus enum exists
DO $$ BEGIN
  CREATE TYPE "ContentStatus" AS ENUM (
    'DRAFT',
    'UNDER_REVIEW',
    'PUBLISHED',
    'REJECTED',
    'IMPROVEMENT_REQUIRED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Ensure ContentStatus has all required values
DO $$ BEGIN
  ALTER TYPE "ContentStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
  ALTER TYPE "ContentStatus" ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';
  ALTER TYPE "ContentStatus" ADD VALUE IF NOT EXISTS 'PUBLISHED';
  ALTER TYPE "ContentStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
  ALTER TYPE "ContentStatus" ADD VALUE IF NOT EXISTS 'IMPROVEMENT_REQUIRED';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- User / Organization verification flags
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "isVerifiedByAdmin" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Organizations"
  ADD COLUMN IF NOT EXISTS "isVerifiedByAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Moderation fields for content entities
ALTER TABLE "Events"
  ADD COLUMN IF NOT EXISTS "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "reviewFeedback" TEXT;

ALTER TABLE "Opportunity"
  ADD COLUMN IF NOT EXISTS "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "reviewFeedback" TEXT;

ALTER TABLE "News"
  ADD COLUMN IF NOT EXISTS "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "reviewFeedback" TEXT;

ALTER TABLE "Resource"
  ADD COLUMN IF NOT EXISTS "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "reviewFeedback" TEXT;
