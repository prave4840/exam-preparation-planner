import * as dashboardService from '../services/dashboardService.js';
import { successResponse } from '../utils/response.js';
import prisma from '../prisma.js';

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    return successResponse(res, stats, 200);
  } catch (error) {
    next(error);
  }
};

export const seedDatabaseHandler = async (req, res, next) => {
  try {
    const { seedDatabase } = await import('../../prisma/seed.js');
    await seedDatabase(prisma);
    const stats = await dashboardService.getDashboardStats();
    return successResponse(res, stats, 200, 'Database seeded successfully with sample courses!');
  } catch (error) {
    next(error);
  }
};

