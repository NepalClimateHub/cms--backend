-- AlterTable
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "verification_code" VARCHAR(50);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "certificates_verification_code_idx" ON "certificates"("verification_code");
