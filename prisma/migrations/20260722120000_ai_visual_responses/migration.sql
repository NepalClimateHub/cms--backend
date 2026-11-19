ALTER TABLE "chat_messages"
  ADD COLUMN "metadata" JSONB;

CREATE TABLE "ai_assistant_settings" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "visual_responses_enabled" BOOLEAN NOT NULL DEFAULT false,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_by" UUID,

  CONSTRAINT "ai_assistant_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "ai_assistant_settings" (
  "id",
  "visual_responses_enabled",
  "updated_at"
) VALUES (1, false, CURRENT_TIMESTAMP);
