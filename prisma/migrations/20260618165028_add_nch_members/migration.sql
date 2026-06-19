-- CreateTable
CREATE TABLE "nch_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "currentAddress" TEXT,
    "permanentAddress" TEXT,
    "phoneNumber" TEXT,
    "linkedinProfile" TEXT,
    "photoUrl" TEXT,
    "photoId" TEXT,
    "bio" TEXT,
    "role" TEXT NOT NULL,
    "startDate" TIMESTAMPTZ(6),
    "endDate" TIMESTAMPTZ(6),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "team" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nch_members_pkey" PRIMARY KEY ("id")
);
