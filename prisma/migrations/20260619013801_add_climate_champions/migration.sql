-- CreateTable
CREATE TABLE "nch_climate_champions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "photoId" TEXT,
    "tags" TEXT[],
    "website" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nch_climate_champions_pkey" PRIMARY KEY ("id")
);
