-- Optional external Google Form link for a vacancy
ALTER TABLE "nch_vacancies"
ADD COLUMN IF NOT EXISTS "googleFormLink" TEXT;
