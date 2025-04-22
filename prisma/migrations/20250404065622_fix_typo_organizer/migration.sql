/*
  Warnings:

  - You are about to drop the column `organizaer` on the `Events` table. All the data in the column will be lost.
  - You are about to drop the column `organizaer` on the `Opportunity` table. All the data in the column will be lost.
  - Added the required column `organizer` to the `Events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizer` to the `Opportunity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Events" DROP COLUMN "organizaer",
ADD COLUMN     "organizer" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "organizaer",
ADD COLUMN     "organizer" TEXT NOT NULL;
