-- Ensure "User"."isEmailVerified" exists. Older DBs may still have "isAccountVerified"
-- (rename migration not applied or DB created before migrate deploy).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'isAccountVerified'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'isEmailVerified'
  ) THEN
    ALTER TABLE "User" RENAME COLUMN "isAccountVerified" TO "isEmailVerified";
  END IF;
END $$;
