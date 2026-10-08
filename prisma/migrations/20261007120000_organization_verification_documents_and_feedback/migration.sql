ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ORGANIZATION_VERIFICATION_MESSAGE';

ALTER TABLE "Organizations"
  ADD COLUMN IF NOT EXISTS "verificationDocuments" JSONB,
  ADD COLUMN IF NOT EXISTS "verificationAdminMessage" TEXT,
  ADD COLUMN IF NOT EXISTS "verificationMessageSentAt" TIMESTAMPTZ(6);

-- Preserve every existing one-document request in the new, bounded collection.
UPDATE "Organizations"
SET "verificationDocuments" = jsonb_build_array(
  jsonb_build_object('id', "verificationDocumentId", 'url', "verificationDocumentUrl")
)
WHERE "verificationDocuments" IS NULL
  AND "verificationDocumentId" IS NOT NULL
  AND "verificationDocumentUrl" IS NOT NULL;
