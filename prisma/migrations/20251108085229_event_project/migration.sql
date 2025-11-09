/*
  Warnings:

  - You are about to drop the column `actualProjectId` on the `Event` table. All the data in the column will be lost.
  - Added the required column `projectId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_actualProjectId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "actualProjectId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
