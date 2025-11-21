/*
  Warnings:

  - You are about to drop the column `reportId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `reportId` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the column `originalContractAward` on the `Report` table. All the data in the column will be lost.
  - Added the required column `projectId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Issue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalContractAward` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_reportId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_reportId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "reportId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "reportId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "originalContractAward" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "originalContractAward";

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
