-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "ActivityEntity" AS ENUM ('AUTH', 'BLOG', 'EVENT', 'NEWS', 'OPPORTUNITY', 'PROJECT', 'RESOURCE', 'MEMBER', 'CLIMATE_CHAMPION');

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "entity" "ActivityEntity" NOT NULL,
    "entityId" TEXT,
    "entityName" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_entity_idx" ON "activity_logs"("entity");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");
