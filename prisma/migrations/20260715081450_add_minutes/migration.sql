-- CreateTable
CREATE TABLE "nch_minutes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "meetingTime" TEXT,
    "agenda" TEXT NOT NULL,
    "meetingSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "nch_minutes_pkey" PRIMARY KEY ("id")
);
