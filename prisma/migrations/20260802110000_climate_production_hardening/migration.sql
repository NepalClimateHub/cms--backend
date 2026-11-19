CREATE TABLE "climate_query_audits" (
  "id" TEXT NOT NULL,
  "request_hash" VARCHAR(64) NOT NULL,
  "route" VARCHAR(32) NOT NULL DEFAULT 'climate_data',
  "query_plan" JSONB NOT NULL,
  "cache_hit" BOOLEAN NOT NULL DEFAULT false,
  "success" BOOLEAN NOT NULL,
  "duration_ms" INTEGER NOT NULL,
  "result_count" INTEGER NOT NULL DEFAULT 0,
  "station_count" INTEGER NOT NULL DEFAULT 0,
  "visual_type" VARCHAR(40),
  "error" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "climate_query_audits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "climate_query_audits_created_at_idx" ON "climate_query_audits"("created_at");
CREATE INDEX "climate_query_audits_route_success_created_at_idx" ON "climate_query_audits"("route", "success", "created_at");
CREATE INDEX "climate_query_audits_request_hash_created_at_idx" ON "climate_query_audits"("request_hash", "created_at");
