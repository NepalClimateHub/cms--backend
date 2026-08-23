-- AlterEnum
ALTER TYPE "ActivityEntity" ADD VALUE 'VACANCY';

-- CreateTable
CREATE TABLE "nch_vacancies" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "openings" INTEGER NOT NULL DEFAULT 1,
    "duration" TEXT,
    "hoursPerWeek" TEXT,
    "overview" TEXT,
    "responsibilities" TEXT [] DEFAULT ARRAY[]::TEXT [],
    "requirements" TEXT [] DEFAULT ARRAY[]::TEXT [],
    "location" TEXT,
    "type" TEXT,
    "deadline" TIMESTAMPTZ(6),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "nch_vacancies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nch_vacancy_applications" (
    "id" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "currentAddress" TEXT,
    "message" TEXT,
    "cvUrl" TEXT NOT NULL,
    "cvFileId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "nch_vacancy_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nch_vacancy_applications_vacancyId_idx" ON "nch_vacancy_applications" ("vacancyId");

-- AddForeignKey
ALTER TABLE "nch_vacancy_applications"
ADD CONSTRAINT "nch_vacancy_applications_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "nch_vacancies" ("id") ON DELETE CASCADE ON UPDATE CASCADE;