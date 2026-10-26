import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasksApi.js';
import { useToast } from './useToast.js';

/**
 * Reusable optimistic update hook for toggling task completion status
 * Adheres strictly to the 6-step optimistic update lifecycle:
 * 1. Immediately update UI state in cache
 * 2. Update associated exam progress bar immediately
 * 3. Send PATCH request via Axios
 * 4. Restore previous cached state on failure (rollback)
 * 5. Show user-facing feedback toast
 * 6. Invalidate and refetch queries on settle
 */
export const useToggleTask = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ taskId, currentDone }) => {
      const nextDone = !currentDone;
      return await tasksApi.update(taskId, { done: nextDone });
    },

    onMutate: async ({ taskId, currentDone, examId }) => {
      const nextDone = !currentDone;
      const delta = nextDone ? 1 : -1;

      // 1. Cancel all outgoing refetches to prevent optimistic overwrites
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      await queryClient.cancelQueries({ queryKey: ['exams'] });
      if (examId) {
        await queryClient.cancelQueries({ queryKey: ['exam', examId] });
      }
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });

      // 2. Snapshot previous states for rollback
      const previousTasks = queryClient.getQueriesData({ queryKey: ['tasks'] });
      const previousExams = queryClient.getQueryData(['exams']);
      const previousExam = examId ? queryClient.getQueryData(['exam', examId]) : null;
      const previousDashboard = queryClient.getQueryData(['dashboard']);

      // 3. Optimistically update all matching ['tasks'] caches
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((task) =>
          task.id === taskId ? { ...task, done: nextDone } : task
        );
      });

      // 4. Optimistically update single exam cache and its progress bar
      if (examId) {
        queryClient.setQueryData(['exam', examId], (oldExam) => {
          if (!oldExam) return oldExam;
          const updatedTasks = (oldExam.tasks || []).map((t) =>
            t.id === taskId ? { ...t, done: nextDone } : t
          );
          const totalTasks = updatedTasks.length;
          const completedTasks = Math.max(0, (oldExam.completedTasks || 0) + delta);
          const pendingTasks = Math.max(0, totalTasks - completedTasks);
          const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

          return {
            ...oldExam,
            tasks: updatedTasks,
            completedTasks,
            pendingTasks,
            progress,
          };
        });
      }

      // 5. Optimistically update ['exams'] list cache
      queryClient.setQueryData(['exams'], (oldExams) => {
        if (!Array.isArray(oldExams)) return oldExams;
        return oldExams.map((exam) => {
          if (examId && exam.id !== examId) return exam;
          // If task belongs to this exam
          const taskExists = (exam.tasks || []).some((t) => t.id === taskId);
          if (!taskExists && exam.id !== examId) return exam;

          const total = exam.totalTasks || 0;
          const completed = Math.max(0, (exam.completedTasks || 0) + delta);
          const pending = Math.max(0, total - completed);
          const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

          return {
            ...exam,
            completedTasks: completed,
            pendingTasks: pending,
            progress,
            tasks: (exam.tasks || []).map((t) =>
              t.id === taskId ? { ...t, done: nextDone } : t
            ),
          };
        });
      });

      // 6. Optimistically update ['dashboard'] cache
      queryClient.setQueryData(['dashboard'], (oldDash) => {
        if (!oldDash) return oldDash;
        const total = oldDash.totalTasks || 0;
        const completed = Math.max(0, (oldDash.completedTasks || 0) + delta);
        const pending = Math.max(0, total - completed);
        const overall = total === 0 ? 0 : Math.round((completed / total) * 100);

        const updatedSubjectProgress = (oldDash.subjectProgress || []).map((sp) => {
          if (examId && sp.id !== examId) return sp;
          const spTotal = sp.totalTasks || 0;
          const spCompleted = Math.max(0, (sp.completedTasks || 0) + delta);
          const spProgress = spTotal === 0 ? 0 : Math.round((spCompleted / spTotal) * 100);
          return {
            ...sp,
            completedTasks: spCompleted,
            pendingTasks: Math.max(0, spTotal - spCompleted),
            progress: spProgress,
          };
        });

        const updatedTodayTasks = (oldDash.todayTasks || []).map((t) =>
          t.id === taskId ? { ...t, done: nextDone } : t
        );

        return {
          ...oldDash,
          completedTasks: completed,
          pendingTasks: pending,
          overallPreparationPercentage: overall,
          subjectProgress: updatedSubjectProgress,
          todayTasks: updatedTodayTasks,
        };
      });

      // Return snapshot context for rollback
      return {
        previousTasks,
        previousExams,
        previousExam,
        previousDashboard,
        examId,
        nextDone,
      };
    },

    onError: (err, variables, context) => {
      // 4. Rollback to snapshot on error
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousExams) {
        queryClient.setQueryData(['exams'], context.previousExams);
      }
      if (context?.previousExam && context?.examId) {
        queryClient.setQueryData(['exam', context.examId], context.previousExam);
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(['dashboard'], context.previousDashboard);
      }

      // 5. Show error toast
      toast.error(err.message || 'Failed to update task status. Restored previous state.');
    },

    onSuccess: (data, variables) => {
      // 5. Show success toast
      if (variables.currentDone) {
        toast.info('Task marked pending');
      } else {
        toast.success('Task completed! Great progress! 🎉');
      }
    },

    onSettled: (data, error, variables) => {
      // 6. Invalidate queries to ensure database truth
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      if (variables?.examId) {
        queryClient.invalidateQueries({ queryKey: ['exam', variables.examId] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export default useToggleTask;
