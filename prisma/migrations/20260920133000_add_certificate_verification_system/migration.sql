-- AlterEnum
ALTER TYPE "ActivityEntity" ADD VALUE 'CERTIFICATE';

-- CreateTable
CREATE TABLE "volunteers" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "profile_picture_url" TEXT,
    "email" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "certificate_number" VARCHAR(50) NOT NULL,
    "verification_token_hash" CHAR(64) NOT NULL,
    "volunteer_id" UUID NOT NULL,
    "certificate_type" VARCHAR(50) NOT NULL,
    "role" VARCHAR(100) NOT NULL,
    "date_joined" DATE NOT NULL,
    "date_ended" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),
    "revocation_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_verification_logs" (
    "id" UUID NOT NULL,
    "certificate_id" UUID,
    "result" VARCHAR(20) NOT NULL,
    "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_hash" VARCHAR(64),
    "user_agent" TEXT,

    CONSTRAINT "certificate_verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificate_number_key" ON "certificates"("certificate_number");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_verification_token_hash_key" ON "certificates"("verification_token_hash");

-- CreateIndex
CREATE INDEX "certificates_verification_token_hash_idx" ON "certificates"("verification_token_hash");

-- CreateIndex
CREATE INDEX "certificate_verification_logs_certificate_id_idx" ON "certificate_verification_logs"("certificate_id");

-- CreateIndex
CREATE INDEX "certificate_verification_logs_requested_at_idx" ON "certificate_verification_logs"("requested_at");

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_verification_logs" ADD CONSTRAINT "certificate_verification_logs_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
