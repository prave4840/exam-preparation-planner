import prisma from '../prisma.js';
import { isAfterDate } from '../utils/dateUtils.js';
import { AppError } from '../middleware/errorHandler.js';

export const getTasksByExamId = async (examId, query = {}) => {
  const numericExamId = parseInt(examId, 10);

  // Verify exam exists
  const exam = await prisma.exam.findUnique({
    where: { id: numericExamId },
  });

  if (!exam) {
    throw new AppError(`Exam with ID ${numericExamId} not found`, 404);
  }

  const where = { examId: numericExamId };

  if (query.done === 'true') {
    where.done = true;
  } else if (query.done === 'false') {
    where.done = false;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (query.filter === 'completed') {
    where.done = true;
  } else if (query.filter === 'pending') {
    where.done = false;
  } else if (query.filter === 'today') {
    where.plannedDate = {
      gte: todayStart,
      lte: todayEnd,
    };
  } else if (query.filter === 'upcoming') {
    where.done = false;
    where.plannedDate = {
      gte: todayStart,
    };
  }

  return prisma.studyTask.findMany({
    where,
    include: {
      exam: {
        select: { id: true, subject: true, examDate: true },
      },
    },
    orderBy: { plannedDate: 'asc' },
  });
};

export const getAllTasks = async (query = {}) => {
  const where = {};

  if (query.examId) {
    where.examId = parseInt(query.examId, 10);
  }

  if (query.done === 'true') {
    where.done = true;
  } else if (query.done === 'false') {
    where.done = false;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (query.filter === 'completed') {
    where.done = true;
  } else if (query.filter === 'pending') {
    where.done = false;
  } else if (query.filter === 'today') {
    where.plannedDate = {
      gte: todayStart,
      lte: todayEnd,
    };
  } else if (query.filter === 'upcoming') {
    where.done = false;
    where.plannedDate = {
      gte: todayStart,
    };
  }

  return prisma.studyTask.findMany({
    where,
    include: {
      exam: {
        select: { id: true, subject: true, examDate: true },
      },
    },
    orderBy: { plannedDate: 'asc' },
  });
};

export const getTaskById = async (id) => {
  const numericId = parseInt(id, 10);
  const task = await prisma.studyTask.findUnique({
    where: { id: numericId },
    include: {
      exam: {
        select: { id: true, subject: true, examDate: true },
      },
    },
  });

  if (!task) {
    throw new AppError(`Task with ID ${numericId} not found`, 404);
  }

  return task;
};

export const createTask = async (examId, { title, plannedDate, minutes }) => {
  const numericExamId = parseInt(examId, 10);

  // Check exam exists
  const exam = await prisma.exam.findUnique({
    where: { id: numericExamId },
  });

  if (!exam) {
    throw new AppError(`Exam with ID ${numericExamId} not found`, 404);
  }

  const parsedPlannedDate = new Date(plannedDate);
  const parsedMinutes = parseInt(minutes, 10);

  // Validation: planned task date cannot be after exam date
  if (isAfterDate(parsedPlannedDate, exam.examDate)) {
    throw new AppError('Planned task date cannot be after its exam date', 400, [
      {
        field: 'plannedDate',
        message: 'Planned task date cannot be after its exam date',
      },
    ]);
  }

  // Validation: study duration between 15 and 480
  if (isNaN(parsedMinutes) || parsedMinutes < 15 || parsedMinutes > 480) {
    throw new AppError('Study duration must be between 15 and 480 minutes', 400, [
      {
        field: 'minutes',
        message: 'Study duration must be between 15 and 480 minutes',
      },
    ]);
  }

  // Duplicate task title check within the same exam
  const existing = await prisma.studyTask.findFirst({
    where: {
      examId: numericExamId,
      title: { equals: title.trim(), mode: 'insensitive' },
    },
  });

  if (existing) {
    throw new AppError('A study task with this title already exists for this exam', 409, [
      {
        field: 'title',
        message: 'A study task with this title already exists for this exam',
      },
    ]);
  }

  return prisma.studyTask.create({
    data: {
      examId: numericExamId,
      title: title.trim(),
      plannedDate: parsedPlannedDate,
      minutes: parsedMinutes,
      done: false,
    },
    include: {
      exam: {
        select: { id: true, subject: true, examDate: true },
      },
    },
  });
};

export const updateTask = async (id, updateFields) => {
  const numericId = parseInt(id, 10);

  const existingTask = await prisma.studyTask.findUnique({
    where: { id: numericId },
    include: { exam: true },
  });

  if (!existingTask) {
    throw new AppError(`Task with ID ${numericId} not found`, 404);
  }

  const data = {};

  if (updateFields.title !== undefined) {
    const trimmedTitle = updateFields.title.trim();
    if (!trimmedTitle) {
      throw new AppError('Task title cannot be empty', 400, [
        { field: 'title', message: 'Task title cannot be empty' },
      ]);
    }

    // Check duplicate title within the same exam
    const duplicate = await prisma.studyTask.findFirst({
      where: {
        id: { not: numericId },
        examId: existingTask.examId,
        title: { equals: trimmedTitle, mode: 'insensitive' },
      },
    });

    if (duplicate) {
      throw new AppError('A study task with this title already exists for this exam', 409, [
        {
          field: 'title',
          message: 'A study task with this title already exists for this exam',
        },
      ]);
    }

    data.title = trimmedTitle;
  }

  if (updateFields.plannedDate !== undefined) {
    const parsedPlannedDate = new Date(updateFields.plannedDate);
    if (isAfterDate(parsedPlannedDate, existingTask.exam.examDate)) {
      throw new AppError('Planned task date cannot be after its exam date', 400, [
        {
          field: 'plannedDate',
          message: 'Planned task date cannot be after its exam date',
        },
      ]);
    }
    data.plannedDate = parsedPlannedDate;
  }

  if (updateFields.minutes !== undefined) {
    const parsedMinutes = parseInt(updateFields.minutes, 10);
    if (isNaN(parsedMinutes) || parsedMinutes < 15 || parsedMinutes > 480) {
      throw new AppError('Study duration must be between 15 and 480 minutes', 400, [
        {
          field: 'minutes',
          message: 'Study duration must be between 15 and 480 minutes',
        },
      ]);
    }
    data.minutes = parsedMinutes;
  }

  if (updateFields.done !== undefined) {
    data.done = Boolean(updateFields.done);
  }

  return prisma.studyTask.update({
    where: { id: numericId },
    data,
    include: {
      exam: {
        select: { id: true, subject: true, examDate: true },
      },
    },
  });
};

export const deleteTask = async (id) => {
  const numericId = parseInt(id, 10);

  const existing = await prisma.studyTask.findUnique({
    where: { id: numericId },
  });

  if (!existing) {
    throw new AppError(`Task with ID ${numericId} not found`, 404);
  }

  await prisma.studyTask.delete({
    where: { id: numericId },
  });

  return { success: true, message: `Task ${numericId} deleted` };
};
