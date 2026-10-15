ALTER TABLE "ai_assistant_settings"
  ADD COLUMN "climate_data_enabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "climate_maps_enabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "graph_rag_enabled" BOOLEAN NOT NULL DEFAULT false;

CREATE TYPE "ClimateIngestionMode" AS ENUM ('BACKFILL', 'INCREMENTAL');
CREATE TYPE "ClimateIngestionStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');

CREATE TABLE "climate_datasets" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(64) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "provider" VARCHAR(120) NOT NULL,
  "source_url" TEXT NOT NULL,
  "temporal_grain" VARCHAR(20) NOT NULL DEFAULT 'month',
  "last_synced_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "climate_datasets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "climate_stations" (
  "id" VARCHAR(32) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "country_code" VARCHAR(3) NOT NULL,
  "country_name" VARCHAR(100) NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "elevation_m" DOUBLE PRECISION,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "climate_stations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "climate_indicators" (
  "code" VARCHAR(24) NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "unit" VARCHAR(24) NOT NULL,
  "aggregation" VARCHAR(40) NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "climate_indicators_pkey" PRIMARY KEY ("code")
);

CREATE TABLE "climate_ingestion_runs" (
  "id" UUID NOT NULL,
  "mode" "ClimateIngestionMode" NOT NULL,
  "status" "ClimateIngestionStatus" NOT NULL DEFAULT 'QUEUED',
  "stage" VARCHAR(80) NOT NULL DEFAULT 'queued',
  "requested_by" VARCHAR(255),
  "started_at" TIMESTAMPTZ(6),
  "heartbeat_at" TIMESTAMPTZ(6),
  "completed_at" TIMESTAMPTZ(6),
  "rows_processed" INTEGER NOT NULL DEFAULT 0,
  "station_count" INTEGER NOT NULL DEFAULT 0,
  "batch_count" INTEGER NOT NULL DEFAULT 0,
  "failed_batches" INTEGER NOT NULL DEFAULT 0,
  "error" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "climate_ingestion_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "climate_monthly_observations" (
  "id" TEXT NOT NULL,
  "dataset_id" TEXT NOT NULL,
  "station_id" VARCHAR(32) NOT NULL,
  "indicator_code" VARCHAR(24) NOT NULL,
  "period" DATE NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "unit" VARCHAR(24) NOT NULL,
  "days_missing" INTEGER,
  "quality_flag" VARCHAR(40),
  "attributes" JSONB NOT NULL DEFAULT '{}',
  "source_run_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "climate_monthly_observations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "climate_normals" (
  "id" TEXT NOT NULL,
  "station_id" VARCHAR(32) NOT NULL,
  "indicator_code" VARCHAR(24) NOT NULL,
  "calendar_month" INTEGER NOT NULL,
  "baseline_start" INTEGER NOT NULL DEFAULT 1991,
  "baseline_end" INTEGER NOT NULL DEFAULT 2020,
  "value" DOUBLE PRECISION NOT NULL,
  "valid_years" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "climate_normals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "climate_source_manifests" (
  "id" TEXT NOT NULL,
  "run_id" UUID NOT NULL,
  "dataset_id" TEXT NOT NULL,
  "checksum" VARCHAR(64) NOT NULL,
  "archive_path" TEXT NOT NULL,
  "request_url" TEXT NOT NULL,
  "response_bytes" INTEGER NOT NULL,
  "row_count" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "climate_source_manifests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "climate_datasets_code_key" ON "climate_datasets"("code");
CREATE INDEX "climate_datasets_provider_idx" ON "climate_datasets"("provider");
CREATE INDEX "climate_stations_country_code_idx" ON "climate_stations"("country_code");
CREATE INDEX "climate_stations_latitude_longitude_idx" ON "climate_stations"("latitude", "longitude");
CREATE UNIQUE INDEX "climate_monthly_observations_dataset_id_station_id_indic_key" ON "climate_monthly_observations"("dataset_id", "station_id", "indicator_code", "period");
CREATE INDEX "climate_monthly_observations_station_id_indicator_code_per_idx" ON "climate_monthly_observations"("station_id", "indicator_code", "period");
CREATE INDEX "climate_monthly_observations_indicator_code_period_idx" ON "climate_monthly_observations"("indicator_code", "period");
CREATE INDEX "climate_monthly_observations_source_run_id_idx" ON "climate_monthly_observations"("source_run_id");
CREATE UNIQUE INDEX "climate_normals_station_id_indicator_code_calendar_month_b_key" ON "climate_normals"("station_id", "indicator_code", "calendar_month", "baseline_start", "baseline_end");
CREATE INDEX "climate_normals_indicator_code_calendar_month_idx" ON "climate_normals"("indicator_code", "calendar_month");
CREATE INDEX "climate_ingestion_runs_status_created_at_idx" ON "climate_ingestion_runs"("status", "created_at");
CREATE UNIQUE INDEX "climate_source_manifests_run_id_checksum_key" ON "climate_source_manifests"("run_id", "checksum");
CREATE INDEX "climate_source_manifests_checksum_idx" ON "climate_source_manifests"("checksum");
CREATE INDEX "climate_source_manifests_dataset_id_created_at_idx" ON "climate_source_manifests"("dataset_id", "created_at");

ALTER TABLE "climate_monthly_observations" ADD CONSTRAINT "climate_monthly_observations_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "climate_datasets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "climate_monthly_observations" ADD CONSTRAINT "climate_monthly_observations_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "climate_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "climate_monthly_observations" ADD CONSTRAINT "climate_monthly_observations_indicator_code_fkey" FOREIGN KEY ("indicator_code") REFERENCES "climate_indicators"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "climate_monthly_observations" ADD CONSTRAINT "climate_monthly_observations_source_run_id_fkey" FOREIGN KEY ("source_run_id") REFERENCES "climate_ingestion_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "climate_normals" ADD CONSTRAINT "climate_normals_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "climate_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "climate_normals" ADD CONSTRAINT "climate_normals_indicator_code_fkey" FOREIGN KEY ("indicator_code") REFERENCES "climate_indicators"("code") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "climate_source_manifests" ADD CONSTRAINT "climate_source_manifests_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "climate_ingestion_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "climate_source_manifests" ADD CONSTRAINT "climate_source_manifests_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "climate_datasets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
