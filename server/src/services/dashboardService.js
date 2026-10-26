import prisma from '../prisma.js';
import { calculateDaysRemaining } from '../utils/dateUtils.js';

export const getDashboardStats = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Fetch all exams with their tasks
  const exams = await prisma.exam.findMany({
    include: {
      tasks: {
        orderBy: { plannedDate: 'asc' },
      },
    },
    orderBy: { examDate: 'asc' },
  });

  // Calculate subject-wise progress and aggregates
  let totalTasks = 0;
  let completedTasks = 0;
  let upcomingExamsCount = 0;

  const subjectProgress = exams.map((exam) => {
    const daysRemaining = calculateDaysRemaining(exam.examDate);
    const isUpcoming = daysRemaining >= 0;
    if (isUpcoming) upcomingExamsCount++;

    const examTotalTasks = exam.tasks.length;
    const examCompletedTasks = exam.tasks.filter((t) => t.done).length;
    const examPendingTasks = examTotalTasks - examCompletedTasks;
    const examProgress =
      examTotalTasks === 0 ? 0 : Math.round((examCompletedTasks / examTotalTasks) * 100);

    totalTasks += examTotalTasks;
    completedTasks += examCompletedTasks;

    return {
      id: exam.id,
      subject: exam.subject,
      examDate: exam.examDate,
      daysRemaining,
      totalTasks: examTotalTasks,
      completedTasks: examCompletedTasks,
      pendingTasks: examPendingTasks,
      progress: examProgress,
      isUpcoming,
    };
  });

  const pendingTasks = totalTasks - completedTasks;
  const overallPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Find the nearest upcoming exam
  const upcomingExams = subjectProgress.filter((e) => e.daysRemaining >= 0);
  const nearestExam = upcomingExams.length > 0 ? upcomingExams[0] : null;

  // Fetch today's study tasks
  const todayTasks = await prisma.studyTask.findMany({
    where: {
      plannedDate: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    include: {
      exam: {
        select: { id: true, subject: true, examDate: true },
      },
    },
    orderBy: [{ done: 'asc' }, { plannedDate: 'asc' }],
  });

  return {
    totalExams: exams.length,
    upcomingExamsCount,
    totalTasks,
    completedTasks,
    pendingTasks,
    overallPreparationPercentage: overallPercentage,
    nearestExam,
    subjectProgress,
    todayTasks,
  };
};
