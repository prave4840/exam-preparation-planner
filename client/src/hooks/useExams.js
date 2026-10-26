import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examsApi } from '../api/examsApi.js';
import { useToast } from './useToast.js';

export const useExams = () => {
  return useQuery({
    queryKey: ['exams'],
    queryFn: examsApi.getAll,
  });
};

export const useExam = (id) => {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => examsApi.getById(id),
    enabled: Boolean(id),
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: examsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Exam "${data.subject}" created successfully! 📚`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create exam');
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => examsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Exam details updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update exam');
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: examsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Exam and associated tasks deleted');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete exam');
    },
  });
};
