import axiosClient from './axiosClient.js';

export const dashboardApi = {
  // GET /api/dashboard
  getStats: async () => {
    const res = await axiosClient.get('/dashboard');
    return res.data;
  },
};
