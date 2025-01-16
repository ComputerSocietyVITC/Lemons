/*
  Warnings:

  - A unique constraint covering the columns `[projectId]` on the table `Evaluation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_projectId_key" ON "Evaluation"("projectId");
