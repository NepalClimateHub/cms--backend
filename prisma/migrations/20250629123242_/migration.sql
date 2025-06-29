/*
  Warnings:

  - You are about to drop the column `socialsId` on the `Opportunity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "socialsId";

-- AlterTable
ALTER TABLE "Tags" ADD COLUMN     "isBlogTag" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "author" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "readingTime" TEXT,
    "publishedDate" TIMESTAMP(3),
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "bannerImageUrl" TEXT,
    "bannerImageId" TEXT,
    "contributedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BlogToTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BlogToTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BlogToTags_B_index" ON "_BlogToTags"("B");

-- AddForeignKey
ALTER TABLE "_BlogToTags" ADD CONSTRAINT "_BlogToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogToTags" ADD CONSTRAINT "_BlogToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
