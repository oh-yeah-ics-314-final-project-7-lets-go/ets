/*
  Warnings:

  - You are about to drop the `Stuff` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `status` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'DENIED', 'APPROVED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "status" "ProjectStatus" NOT NULL;

-- DropTable
DROP TABLE "Stuff";

-- DropEnum
DROP TYPE "Condition";
