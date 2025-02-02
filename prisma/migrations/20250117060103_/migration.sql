/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Evaluation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,projectId]` on the table `Evaluation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Evaluation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Evaluation_projectId_key";

-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_userId_key" ON "Evaluation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_userId_projectId_key" ON "Evaluation"("userId", "projectId");

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
