/*
  Warnings:

  - You are about to drop the column `end` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `planned` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `Event` table. All the data in the column will be lost.
  - Added the required column `actualEnd` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualStart` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plannedEnd` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plannedStart` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "end",
DROP COLUMN "planned",
DROP COLUMN "start",
ADD COLUMN     "actualEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "actualStart" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "plannedEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "plannedStart" TIMESTAMP(3) NOT NULL;
