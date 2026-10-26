import app from './app.js';
import prisma from './prisma.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✓ Successfully connected to PostgreSQL via Prisma ORM');

    // Auto-seed initial course data if database is brand new and empty
    try {
      const examCount = await prisma.exam.count();
      if (examCount === 0) {
        console.log('Database has no exams yet. Auto-seeding initial college courses and tasks...');
        const { seedDatabase } = await import('../prisma/seed.js');
        await seedDatabase(prisma);
        console.log('✓ Initial college courses seeded successfully');
      }
    } catch (seedErr) {
      console.warn('Note on auto-seeding:', seedErr.message);
    }

    const server = app.listen(PORT, () => {
      console.log(`✓ ExamReady Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
      console.log(`✓ API Health Check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Gracefully closing server and database connections...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✓ Database disconnected. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
