-- Blog.status was created as BlogStatus (20251227152652); schema uses ContentStatus like other moderated entities.
ALTER TABLE "Blog" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Blog" ALTER COLUMN "status" TYPE "ContentStatus" USING ("status"::text::"ContentStatus");
ALTER TABLE "Blog" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"ContentStatus";

DROP TYPE IF EXISTS "BlogStatus";
