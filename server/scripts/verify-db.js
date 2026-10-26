import prisma from '../src/prisma.js';

async function verify() {
  console.log('--- ExamReady Database Verification ---');
  try {
    const examCount = await prisma.exam.count();
    const taskCount = await prisma.studyTask.count();
    const completedTaskCount = await prisma.studyTask.count({ where: { done: true } });

    console.log(`✓ Connected to PostgreSQL database successfully.`);
    console.log(`✓ Total Exams in DB: ${examCount}`);
    console.log(`✓ Total Tasks in DB: ${taskCount} (${completedTaskCount} completed, ${taskCount - completedTaskCount} pending)`);

    const exams = await prisma.exam.findMany({
      include: { tasks: true },
      take: 2,
    });

    console.log('\nSample records:');
    exams.forEach((e) => {
      console.log(`- [Exam #${e.id}] ${e.subject} (${e.tasks.length} tasks scheduled)`);
    });

    console.log('\nDatabase status: HEALTHY & READY');
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
