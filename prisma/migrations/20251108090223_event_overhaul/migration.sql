/*
  Warnings:

  - You are about to drop the column `originalProjectId` on the `Event` table. All the data in the column will be lost.
  - Added the required column `description` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_originalProjectId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "originalProjectId",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "planned" BOOLEAN NOT NULL DEFAULT false;
