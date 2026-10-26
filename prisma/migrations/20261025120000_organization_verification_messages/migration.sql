CREATE TYPE "VerificationMessageSenderType" AS ENUM ('ORGANIZATION', 'ADMIN');

CREATE TABLE "OrganizationVerificationMessage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "senderType" "VerificationMessageSenderType" NOT NULL,
    "senderUserId" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "OrganizationVerificationMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrganizationVerificationMessage_organizationId_createdAt_idx"
  ON "OrganizationVerificationMessage"("organizationId", "createdAt");

ALTER TABLE "OrganizationVerificationMessage"
  ADD CONSTRAINT "OrganizationVerificationMessage_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve existing conversations when upgrading from the legacy single-message fields.
INSERT INTO "OrganizationVerificationMessage" ("id", "organizationId", "senderType", "message", "createdAt", "updatedAt")
SELECT 'legacy-organization-' || "id", "id", 'ORGANIZATION', "verificationRequestRemarks",
       COALESCE("verificationRequestedAt", "updatedAt"), COALESCE("verificationRequestedAt", "updatedAt")
FROM "Organizations"
WHERE NULLIF(BTRIM("verificationRequestRemarks"), '') IS NOT NULL;

INSERT INTO "OrganizationVerificationMessage" ("id", "organizationId", "senderType", "message", "createdAt", "updatedAt")
SELECT 'legacy-admin-' || "id", "id", 'ADMIN', "verificationAdminMessage",
       COALESCE("verificationMessageSentAt", "updatedAt"), COALESCE("verificationMessageSentAt", "updatedAt")
FROM "Organizations"
WHERE NULLIF(BTRIM("verificationAdminMessage"), '') IS NOT NULL;
