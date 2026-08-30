ALTER TABLE "ai_assistant_settings"
  ALTER COLUMN "updated_by" TYPE VARCHAR(255)
  USING "updated_by"::text;
