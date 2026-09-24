-- DropIndex
DROP INDEX "chunks_document_id_chunk_index_key";

-- AlterTable
ALTER TABLE "ai_index_jobs" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "chunks" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "media_type" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "updated_at" DROP DEFAULT;
