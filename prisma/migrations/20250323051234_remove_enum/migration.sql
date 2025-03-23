/*
  Warnings:

  - Changed the type of `locationType` on the `Events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `mode` on the `News` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `locationType` on the `Opportunity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Events" DROP COLUMN "locationType",
ADD COLUMN     "locationType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "News" DROP COLUMN "mode",
ADD COLUMN     "mode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "locationType",
ADD COLUMN     "locationType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "LocationType";
