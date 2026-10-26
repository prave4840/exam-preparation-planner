import axiosClient from './axiosClient.js';

export const examsApi = {
  // GET /api/exams
  getAll: async () => {
    const res = await axiosClient.get('/exams');
    return res.data;
  },

  // GET /api/exams/:id
  getById: async (id) => {
    const res = await axiosClient.get(`/exams/${id}`);
    return res.data;
  },

  // POST /api/exams
  create: async (examData) => {
    const res = await axiosClient.post('/exams', examData);
    return res.data;
  },

  // PUT /api/exams/:id
  update: async (id, examData) => {
    const res = await axiosClient.put(`/exams/${id}`, examData);
    return res.data;
  },

  // DELETE /api/exams/:id
  delete: async (id) => {
    return await axiosClient.delete(`/exams/${id}`);
  },

  // GET /api/exams/:id/tasks
  getTasks: async (id, params = {}) => {
    const res = await axiosClient.get(`/exams/${id}/tasks`, { params });
    return res.data;
  },

  // POST /api/exams/:id/tasks
  createTask: async (id, taskData) => {
    const res = await axiosClient.post(`/exams/${id}/tasks`, taskData);
    return res.data;
  },
};
