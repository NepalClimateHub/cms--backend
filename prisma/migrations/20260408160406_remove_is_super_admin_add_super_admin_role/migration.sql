/*
  Warnings:

  - The `status` column on the `Events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Opportunity` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isSuperAdmin` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "UserType" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "Events" DROP COLUMN "status",
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "status",
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isSuperAdmin";
