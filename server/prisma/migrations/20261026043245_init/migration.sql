-- CreateTable
CREATE TABLE "exams" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_tasks" (
    "id" SERIAL NOT NULL,
    "examId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "plannedDate" TIMESTAMP(3) NOT NULL,
    "minutes" INTEGER NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exams_subject_examDate_key" ON "exams"("subject", "examDate");

-- CreateIndex
CREATE INDEX "study_tasks_examId_idx" ON "study_tasks"("examId");

-- CreateIndex
CREATE INDEX "study_tasks_plannedDate_idx" ON "study_tasks"("plannedDate");

-- CreateIndex
CREATE UNIQUE INDEX "study_tasks_examId_title_key" ON "study_tasks"("examId", "title");

-- AddForeignKey
ALTER TABLE "study_tasks" ADD CONSTRAINT "study_tasks_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "study_tasks" ADD CONSTRAINT "check_study_duration" CHECK ("minutes" >= 15 AND "minutes" <= 480);

