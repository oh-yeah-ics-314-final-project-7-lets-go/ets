/*
  Warnings:

  - You are about to drop the column `monthCreate` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `originalContractAward` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `paidUpToNow` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `Project` table. All the data in the column will be lost.
  - Added the required column `description` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_reportId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_reportId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "monthCreate",
DROP COLUMN "originalContractAward",
DROP COLUMN "paidUpToNow",
DROP COLUMN "progress",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "status" "ProjectStatus" NOT NULL;

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "monthCreate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "originalContractAward" DOUBLE PRECISION NOT NULL,
    "paidUpToNow" DOUBLE PRECISION NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
