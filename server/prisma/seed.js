import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for ExamReady...');

  // Clean existing data
  await prisma.studyTask.deleteMany();
  await prisma.exam.deleteMany();

  const now = new Date();
  
  // Helper to add days
  const addDays = (days, hour = 10) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  // Exam 1: Database Management Systems (Exam in 7 days)
  const exam1 = await prisma.exam.create({
    data: {
      subject: 'Database Management Systems',
      examDate: addDays(7, 9),
      tasks: {
        create: [
          {
            title: 'Relational Algebra & SQL Aggregations',
            plannedDate: addDays(0, 10), // Today!
            minutes: 90,
            done: true,
          },
          {
            title: 'Functional Dependencies & Normalization (1NF - BCNF)',
            plannedDate: addDays(1, 14),
            minutes: 120,
            done: false,
          },
          {
            title: 'Transaction Management & ACID Properties',
            plannedDate: addDays(3, 11),
            minutes: 60,
            done: false,
          },
          {
            title: 'Indexing, B+ Trees & Query Optimization',
            plannedDate: addDays(5, 16),
            minutes: 90,
            done: false,
          },
        ],
      },
    },
  });

  // Exam 2: Operating Systems (Exam in 14 days)
  const exam2 = await prisma.exam.create({
    data: {
      subject: 'Operating Systems',
      examDate: addDays(14, 14),
      tasks: {
        create: [
          {
            title: 'CPU Scheduling Algorithms (FCFS, SJF, RR)',
            plannedDate: addDays(0, 15), // Today!
            minutes: 60,
            done: false,
          },
          {
            title: 'Process Synchronization & Semaphores',
            plannedDate: addDays(2, 10),
            minutes: 90,
            done: true,
          },
          {
            title: 'Memory Management: Paging & Segmentation',
            plannedDate: addDays(4, 11),
            minutes: 120,
            done: false,
          },
          {
            title: 'Deadlock Detection, Prevention & Banker\'s Algorithm',
            plannedDate: addDays(8, 14),
            minutes: 75,
            done: false,
          },
        ],
      },
    },
  });

  // Exam 3: Computer Networks (Exam in 21 days)
  const exam3 = await prisma.exam.create({
    data: {
      subject: 'Computer Networks',
      examDate: addDays(21, 9),
      tasks: {
        create: [
          {
            title: 'OSI 7-Layer & TCP/IP Architecture Comparison',
            plannedDate: addDays(1, 9),
            minutes: 45,
            done: true,
          },
          {
            title: 'IPv4 Subnetting & CIDR Calculations',
            plannedDate: addDays(3, 15),
            minutes: 90,
            done: true,
          },
          {
            title: 'Routing Protocols: Distance Vector vs Link State',
            plannedDate: addDays(7, 10),
            minutes: 60,
            done: false,
          },
          {
            title: 'Transport Layer Protocols: TCP 3-Way Handshake vs UDP',
            plannedDate: addDays(12, 14),
            minutes: 90,
            done: false,
          },
        ],
      },
    },
  });

  // Exam 4: Web Application Development (Exam in 28 days)
  const exam4 = await prisma.exam.create({
    data: {
      subject: 'Full Stack Web Development',
      examDate: addDays(28, 10),
      tasks: {
        create: [
          {
            title: 'React Component Lifecycle & Custom Hooks',
            plannedDate: addDays(2, 16),
            minutes: 120,
            done: true,
          },
          {
            title: 'RESTful API Architecture & Express Middleware',
            plannedDate: addDays(5, 14),
            minutes: 90,
            done: true,
          },
          {
            title: 'Database Modeling with Prisma ORM & PostgreSQL Constraints',
            plannedDate: addDays(10, 11),
            minutes: 150,
            done: false,
          },
        ],
      },
    },
  });

  console.log('✅ Seeding completed successfully:');
  console.log(`- Created 4 exams:`);
  console.log(`  1. ${exam1.subject}`);
  console.log(`  2. ${exam2.subject}`);
  console.log(`  3. ${exam3.subject}`);
  console.log(`  4. ${exam4.subject}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
