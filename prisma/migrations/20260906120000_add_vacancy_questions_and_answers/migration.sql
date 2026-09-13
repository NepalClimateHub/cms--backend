-- Vacancy question set (client-generated ids, stored verbatim as JSON)
ALTER TABLE "nch_vacancies"
ADD COLUMN IF NOT EXISTS "questions" JSONB NOT NULL DEFAULT '[]';

-- Backfill any pre-existing NULLs so reads are never ambiguous between
-- "no questions" and "not loaded"
UPDATE "nch_vacancies" SET "questions" = '[]' WHERE "questions" IS NULL;

-- Per-application answers, snapshotting each question's label and type
ALTER TABLE "nch_vacancy_applications"
ADD COLUMN IF NOT EXISTS "answers" JSONB NOT NULL DEFAULT '[]';

UPDATE "nch_vacancy_applications" SET "answers" = '[]' WHERE "answers" IS NULL;

-- The CMS no longer sends `contact`; free text is now a PARAGRAPH question.
-- Without this every application would 400 on day one.
ALTER TABLE "nch_vacancy_applications"
ALTER COLUMN "contact" DROP NOT NULL;
