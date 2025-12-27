-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'REJECTED');

-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT';
