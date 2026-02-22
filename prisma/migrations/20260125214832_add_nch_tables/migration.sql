-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" UUID NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "source_url" TEXT,
    "total_pages" INTEGER,
    "media_type" VARCHAR(40) NOT NULL DEFAULT 'text/pdf',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chunks" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "page_start" INTEGER,
    "page_end" INTEGER,
    "text" TEXT NOT NULL,
    "vector" JSONB NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "collection" VARCHAR(64) NOT NULL DEFAULT 'main',
    "embed_model" VARCHAR(120) NOT NULL DEFAULT 'intfloat/multilingual-e5-base',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queries" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "text" TEXT NOT NULL,
    "language" VARCHAR(10),
    "routed_model" VARCHAR(80) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retrievals" (
    "id" UUID NOT NULL,
    "query_id" UUID NOT NULL,
    "top_k" INTEGER NOT NULL DEFAULT 10,
    "filters" JSONB NOT NULL DEFAULT '{}',
    "latency_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retrievals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retrieval_hits" (
    "id" UUID NOT NULL,
    "retrieval_id" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "chunk_id" UUID NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "retrieval_hits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" UUID NOT NULL,
    "query_id" UUID NOT NULL,
    "model" VARCHAR(80) NOT NULL,
    "answer_en" TEXT NOT NULL,
    "answer_ne" TEXT,
    "raw" JSONB,
    "tokens_in" INTEGER NOT NULL,
    "tokens_out" INTEGER NOT NULL,
    "latency_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citations" (
    "id" UUID NOT NULL,
    "answer_id" UUID NOT NULL,
    "chunk_id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "page" VARCHAR(40),
    "url" TEXT,

    CONSTRAINT "citations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_sessions_user_id_idx" ON "chat_sessions"("user_id");

-- CreateIndex
CREATE INDEX "chat_messages_session_id_idx" ON "chat_messages"("session_id");

-- CreateIndex
CREATE INDEX "documents_title_idx" ON "documents"("title");

-- CreateIndex
CREATE INDEX "chunks_document_id_idx" ON "chunks"("document_id");

-- CreateIndex
CREATE INDEX "chunks_collection_idx" ON "chunks"("collection");

-- CreateIndex
CREATE UNIQUE INDEX "chunks_document_id_chunk_index_key" ON "chunks"("document_id", "chunk_index");

-- CreateIndex
CREATE INDEX "queries_user_id_idx" ON "queries"("user_id");

-- CreateIndex
CREATE INDEX "retrievals_query_id_idx" ON "retrievals"("query_id");

-- CreateIndex
CREATE INDEX "retrieval_hits_retrieval_id_idx" ON "retrieval_hits"("retrieval_id");

-- CreateIndex
CREATE INDEX "retrieval_hits_chunk_id_idx" ON "retrieval_hits"("chunk_id");

-- CreateIndex
CREATE INDEX "answers_query_id_idx" ON "answers"("query_id");

-- CreateIndex
CREATE INDEX "citations_answer_id_idx" ON "citations"("answer_id");

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retrievals" ADD CONSTRAINT "retrievals_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "queries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retrieval_hits" ADD CONSTRAINT "retrieval_hits_retrieval_id_fkey" FOREIGN KEY ("retrieval_id") REFERENCES "retrievals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retrieval_hits" ADD CONSTRAINT "retrieval_hits_chunk_id_fkey" FOREIGN KEY ("chunk_id") REFERENCES "chunks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "queries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citations" ADD CONSTRAINT "citations_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citations" ADD CONSTRAINT "citations_chunk_id_fkey" FOREIGN KEY ("chunk_id") REFERENCES "chunks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
