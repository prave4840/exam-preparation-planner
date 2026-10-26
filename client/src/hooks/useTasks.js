import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasksApi.js';
import { examsApi } from '../api/examsApi.js';
import { useToast } from './useToast.js';

export const useTasks = (filters = {}) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.getAll(filters),
  });
};

export const useExamTasks = (examId, filters = {}) => {
  return useQuery({
    queryKey: ['examTasks', examId, filters],
    queryFn: () => examsApi.getTasks(examId, filters),
    enabled: Boolean(examId),
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ examId, data }) => examsApi.createTask(examId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam', variables.examId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Study task "${data.title}" added!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create task');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => tasksApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      if (data?.examId) {
        queryClient.invalidateQueries({ queryKey: ['exam', data.examId] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update task');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Study task deleted');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete task');
    },
  });
};
