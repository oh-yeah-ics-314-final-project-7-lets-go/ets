-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "creatorId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
