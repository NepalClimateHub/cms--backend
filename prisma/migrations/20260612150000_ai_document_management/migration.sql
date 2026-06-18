CREATE TYPE "AiDocumentStatus" AS ENUM (
  'UPLOADED',
  'QUEUED',
  'INDEXING',
  'READY',
  'FAILED',
  'DELETE_QUEUED',
  'DELETING',
  'DELETE_CLEANUP_FAILED',
  'DELETED'
);

CREATE TYPE "AiIndexOperation" AS ENUM ('ADD', 'REINDEX', 'DELETE', 'FULL_REBUILD', 'IMPORT');
CREATE TYPE "AiIndexJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');

ALTER TABLE "documents"
  ADD COLUMN "original_filename" VARCHAR(500),
  ADD COLUMN "storage_name" VARCHAR(255),
  ADD COLUMN "checksum" VARCHAR(64),
  ADD COLUMN "file_size" INTEGER,
  ADD COLUMN "status" "AiDocumentStatus" NOT NULL DEFAULT 'READY',
  ADD COLUMN "active_version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "chunk_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "index_error" TEXT,
  ADD COLUMN "uploaded_by" VARCHAR(255),
  ADD COLUMN "indexed_at" TIMESTAMPTZ(6),
  ADD COLUMN "deleted_at" TIMESTAMPTZ(6),
  ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "documents" ALTER COLUMN "media_type" SET DEFAULT 'application/pdf';

ALTER TABLE "chunks"
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "faiss_id" VARCHAR(20),
  ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "chunks" DROP CONSTRAINT IF EXISTS "chunks_document_id_chunk_index_key";

CREATE UNIQUE INDEX "documents_storage_name_key" ON "documents"("storage_name");
CREATE UNIQUE INDEX "documents_checksum_key" ON "documents"("checksum");
CREATE INDEX "documents_status_idx" ON "documents"("status");
CREATE INDEX "documents_deleted_at_idx" ON "documents"("deleted_at");
CREATE UNIQUE INDEX "chunks_faiss_id_key" ON "chunks"("faiss_id");
CREATE UNIQUE INDEX "chunks_document_id_version_chunk_index_key" ON "chunks"("document_id", "version", "chunk_index");

CREATE TABLE "ai_index_jobs" (
  "id" UUID NOT NULL,
  "document_id" UUID,
  "operation" "AiIndexOperation" NOT NULL,
  "status" "AiIndexJobStatus" NOT NULL DEFAULT 'QUEUED',
  "stage" VARCHAR(80) NOT NULL DEFAULT 'queued',
  "attempt" INTEGER NOT NULL DEFAULT 1,
  "error" TEXT,
  "heartbeat_at" TIMESTAMPTZ(6),
  "started_at" TIMESTAMPTZ(6),
  "completed_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_index_jobs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ai_index_jobs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "ai_index_jobs_document_id_status_idx" ON "ai_index_jobs"("document_id", "status");
CREATE INDEX "ai_index_jobs_status_heartbeat_at_idx" ON "ai_index_jobs"("status", "heartbeat_at");
