CREATE TYPE "ClimateRolloutStage" AS ENUM ('DISABLED', 'ADMIN', 'INTERNAL', 'LIMITED', 'ALL');

ALTER TABLE "ai_assistant_settings"
  ADD COLUMN "climate_rollout_stage" "ClimateRolloutStage" NOT NULL DEFAULT 'DISABLED';
