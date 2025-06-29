/*
  Warnings:

  - You are about to drop the `Socials` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Events" DROP CONSTRAINT "Events_socialsId_fkey";

-- DropForeignKey
ALTER TABLE "Opportunity" DROP CONSTRAINT "Opportunity_socialsId_fkey";

-- DropForeignKey
ALTER TABLE "Organizations" DROP CONSTRAINT "Organizations_socialsId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_socialsId_fkey";

-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "socials" JSONB;

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "socials" JSONB;

-- AlterTable
ALTER TABLE "Organizations" ADD COLUMN     "socials" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "socials" JSONB;

-- DropTable
DROP TABLE "Socials";
