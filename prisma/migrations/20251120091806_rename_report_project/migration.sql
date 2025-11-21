/*
  Warnings:

  - You are about to drop the column `projectId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the column `firstRaised` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `totalPaidOut` on the `Project` table. All the data in the column will be lost.
  - Added the required column `reportId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportId` to the `Issue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidUpToNow` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_projectId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "projectId",
ADD COLUMN     "reportId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "projectId",
ADD COLUMN     "reportId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "firstRaised",
DROP COLUMN "name",
DROP COLUMN "status",
DROP COLUMN "totalPaidOut",
ADD COLUMN     "monthCreate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "paidUpToNow" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
