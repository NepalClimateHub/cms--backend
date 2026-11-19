-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityEntity" ADD VALUE 'TESTIMONIAL';
ALTER TYPE "ActivityEntity" ADD VALUE 'USER';
ALTER TYPE "ActivityEntity" ADD VALUE 'ORGANIZATION';

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "team_name" VARCHAR(200),
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "volunteers" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "nch_testimonials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "photoId" TEXT,
    "description" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 5,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nch_testimonials_pkey" PRIMARY KEY ("id")
);
