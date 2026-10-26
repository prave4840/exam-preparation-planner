import * as dashboardService from '../services/dashboardService.js';
import { successResponse } from '../utils/response.js';

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    return successResponse(res, stats, 200);
  } catch (error) {
    next(error);
  }
};
