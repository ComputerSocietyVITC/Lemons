/*
  Warnings:

  - A unique constraint covering the columns `[repoUrl]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[demoUrl]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reportUrl]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "demoUrl" TEXT,
ADD COLUMN     "repoUrl" TEXT,
ADD COLUMN     "reportUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_repoUrl_key" ON "Project"("repoUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Project_demoUrl_key" ON "Project"("demoUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Project_reportUrl_key" ON "Project"("reportUrl");
