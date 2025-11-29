/*
  Warnings:

  - Added the required column `status` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearCreate` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `monthCreate` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Month" AS ENUM ('JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT('PENDING'),
ADD COLUMN     "yearCreate" INTEGER NOT NULL,
DROP COLUMN "monthCreate",
ADD COLUMN     "monthCreate" "Month" NOT NULL;
