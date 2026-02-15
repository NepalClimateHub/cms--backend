-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ResourceType" AS ENUM ('DOCUMENTARY', 'PODCASTS_AND_TELEVISION', 'COURSES', 'PLANS_AND_POLICIES', 'DATA_RESOURCES', 'PLATFORMS', 'RESEARCH_ARTICLES', 'THESES_AND_DISSERTATIONS', 'CASE_STUDIES', 'REPORTS', 'TOOLKITS_AND_GUIDES');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ResourceLevel" AS ENUM ('INTERNATIONAL', 'REGIONAL', 'NATIONAL', 'PROVINCIAL', 'LOCAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ProjectStatus" AS ENUM ('ONGOING', 'COMPLETED', 'UPCOMING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "CategoryType" AS ENUM ('BLOG', 'NEWS', 'EVENTS', 'OPPORTUNITY', 'PROJECT', 'RESOURCE', 'ORGANIZATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" TEXT,
    "overview" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ONGOING',
    "bannerImageUrl" TEXT,
    "bannerImageId" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "type" "ResourceType" NOT NULL,
    "level" "ResourceLevel",
    "link" TEXT,
    "courseProvider" TEXT,
    "platform" TEXT,
    "duration" TEXT,
    "author" TEXT,
    "publicationYear" TEXT,
    "bannerImageUrl" TEXT,
    "bannerImageId" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CategoryType" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "_ProjectToTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectToTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "_ResourceToTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ResourceToTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- AlterTable Tags
ALTER TABLE "Tags" ADD COLUMN IF NOT EXISTS "isProjectTag" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tags" ADD COLUMN IF NOT EXISTS "isResourceTag" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable Blog
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- AlterTable User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currentRole" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "_ProjectToTags_B_index" ON "_ProjectToTags"("B");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "_ResourceToTags_B_index" ON "_ResourceToTags"("B");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "Blog" ADD CONSTRAINT "Blog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "_ProjectToTags" ADD CONSTRAINT "_ProjectToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "_ProjectToTags" ADD CONSTRAINT "_ProjectToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "_ResourceToTags" ADD CONSTRAINT "_ResourceToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "_ResourceToTags" ADD CONSTRAINT "_ResourceToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;