-- Optional link from user account to organization (dashboard profile for org users)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_organizationId_key" ON "User"("organizationId");

ALTER TABLE "User"
  DROP CONSTRAINT IF EXISTS "User_organizationId_fkey";

ALTER TABLE "User"
  ADD CONSTRAINT "User_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Organization verification request (document + message to admins)
ALTER TABLE "Organizations" ADD COLUMN IF NOT EXISTS "verificationDocumentUrl" TEXT;
ALTER TABLE "Organizations" ADD COLUMN IF NOT EXISTS "verificationDocumentId" TEXT;
ALTER TABLE "Organizations" ADD COLUMN IF NOT EXISTS "verificationRequestRemarks" TEXT;
ALTER TABLE "Organizations" ADD COLUMN IF NOT EXISTS "verificationRequestedAt" TIMESTAMPTZ(6);
