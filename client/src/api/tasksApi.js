import axiosClient from './axiosClient.js';

export const tasksApi = {
  // GET /api/tasks
  getAll: async (params = {}) => {
    const res = await axiosClient.get('/tasks', { params });
    return res.data;
  },

  // GET /api/tasks/:id
  getById: async (id) => {
    const res = await axiosClient.get(`/tasks/${id}`);
    return res.data;
  },

  // PATCH /api/tasks/:id
  update: async (id, taskData) => {
    const res = await axiosClient.patch(`/tasks/${id}`, taskData);
    return res.data;
  },

  // DELETE /api/tasks/:id
  delete: async (id) => {
    return await axiosClient.delete(`/tasks/${id}`);
  },
};
