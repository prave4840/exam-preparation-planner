import prisma from '../prisma.js';
import { calculateDaysRemaining, isPastDate, isAfterDate } from '../utils/dateUtils.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAllExams = async () => {
  const exams = await prisma.exam.findMany({
    include: {
      tasks: {
        orderBy: { plannedDate: 'asc' },
      },
    },
    orderBy: { examDate: 'asc' },
  });

  return exams.map((exam) => {
    const totalTasks = exam.tasks.length;
    const completedTasks = exam.tasks.filter((t) => t.done).length;
    const pendingTasks = totalTasks - completedTasks;
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    const daysRemaining = calculateDaysRemaining(exam.examDate);

    return {
      id: exam.id,
      subject: exam.subject,
      examDate: exam.examDate,
      daysRemaining,
      totalTasks,
      completedTasks,
      pendingTasks,
      progress,
      tasks: exam.tasks,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    };
  });
};

export const getExamById = async (id) => {
  const numericId = parseInt(id, 10);
  const exam = await prisma.exam.findUnique({
    where: { id: numericId },
    include: {
      tasks: {
        orderBy: { plannedDate: 'asc' },
      },
    },
  });

  if (!exam) {
    throw new AppError(`Exam with ID ${numericId} not found`, 404);
  }

  const totalTasks = exam.tasks.length;
  const completedTasks = exam.tasks.filter((t) => t.done).length;
  const pendingTasks = totalTasks - completedTasks;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const daysRemaining = calculateDaysRemaining(exam.examDate);

  return {
    id: exam.id,
    subject: exam.subject,
    examDate: exam.examDate,
    daysRemaining,
    totalTasks,
    completedTasks,
    pendingTasks,
    progress,
    tasks: exam.tasks,
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt,
  };
};

export const createExam = async ({ subject, examDate }) => {
  const parsedExamDate = new Date(examDate);

  if (isPastDate(parsedExamDate)) {
    throw new AppError('Exam date must not be in the past', 400, [
      { field: 'examDate', message: 'Exam date must not be in the past' },
    ]);
  }

  // Pre-check duplicate to provide friendly message before hitting DB constraint
  const existing = await prisma.exam.findFirst({
    where: {
      subject: { equals: subject.trim(), mode: 'insensitive' },
      examDate: parsedExamDate,
    },
  });

  if (existing) {
    throw new AppError('An exam with this subject and date already exists', 409, [
      { field: 'subject', message: 'Duplicate exam for subject and date' },
    ]);
  }

  const exam = await prisma.exam.create({
    data: {
      subject: subject.trim(),
      examDate: parsedExamDate,
    },
  });

  return {
    ...exam,
    daysRemaining: calculateDaysRemaining(exam.examDate),
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    progress: 0,
    tasks: [],
  };
};

export const updateExam = async (id, { subject, examDate }) => {
  const numericId = parseInt(id, 10);

  const existingExam = await prisma.exam.findUnique({
    where: { id: numericId },
    include: { tasks: true },
  });

  if (!existingExam) {
    throw new AppError(`Exam with ID ${numericId} not found`, 404);
  }

  const updateData = {};

  if (subject !== undefined) {
    updateData.subject = subject.trim();
  }

  if (examDate !== undefined) {
    const parsedExamDate = new Date(examDate);

    if (isPastDate(parsedExamDate)) {
      throw new AppError('Exam date must not be in the past', 400, [
        { field: 'examDate', message: 'Exam date must not be in the past' },
      ]);
    }

    // Check if any existing tasks are scheduled after the new exam date
    const conflictingTask = existingExam.tasks.find((task) =>
      isAfterDate(task.plannedDate, parsedExamDate)
    );

    if (conflictingTask) {
      throw new AppError(
        `Cannot update exam date to ${parsedExamDate.toISOString().split('T')[0]} because task "${conflictingTask.title}" is scheduled on ${conflictingTask.plannedDate.toISOString().split('T')[0]} (after the exam).`,
        400,
        [
          {
            field: 'examDate',
            message: 'Planned task date cannot be after its exam date',
          },
        ]
      );
    }

    updateData.examDate = parsedExamDate;
  }

  // Check duplicate if subject or examDate changed
  const checkSubject = updateData.subject || existingExam.subject;
  const checkDate = updateData.examDate || existingExam.examDate;

  const duplicate = await prisma.exam.findFirst({
    where: {
      id: { not: numericId },
      subject: { equals: checkSubject, mode: 'insensitive' },
      examDate: checkDate,
    },
  });

  if (duplicate) {
    throw new AppError('An exam with this subject and date already exists', 409, [
      { field: 'subject', message: 'Duplicate exam for subject and date' },
    ]);
  }

  const updatedExam = await prisma.exam.update({
    where: { id: numericId },
    data: updateData,
    include: {
      tasks: {
        orderBy: { plannedDate: 'asc' },
      },
    },
  });

  const totalTasks = updatedExam.tasks.length;
  const completedTasks = updatedExam.tasks.filter((t) => t.done).length;
  const pendingTasks = totalTasks - completedTasks;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    ...updatedExam,
    daysRemaining: calculateDaysRemaining(updatedExam.examDate),
    totalTasks,
    completedTasks,
    pendingTasks,
    progress,
  };
};

export const deleteExam = async (id) => {
  const numericId = parseInt(id, 10);

  const existing = await prisma.exam.findUnique({
    where: { id: numericId },
  });

  if (!existing) {
    throw new AppError(`Exam with ID ${numericId} not found`, 404);
  }

  // Cascading deletion is handled by Postgres foreign key onDelete: Cascade,
  // but explicitly deleting via Prisma works cleanly
  await prisma.exam.delete({
    where: { id: numericId },
  });

  return { success: true, message: `Exam ${numericId} and associated tasks deleted` };
};
