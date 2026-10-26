import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useExam, useUpdateExam, useDeleteExam } from '../hooks/useExams.js';
import { useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks.js';
import { CountdownBadge } from '../components/common/CountdownBadge.jsx';
import { ProgressBar } from '../components/common/ProgressBar.jsx';
import { SkeletonCard } from '../components/common/SkeletonCard.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { TaskItem } from '../components/tasks/TaskItem.jsx';
import { TaskFilters } from '../components/tasks/TaskFilters.jsx';
import { TaskFormModal } from '../components/tasks/TaskFormModal.jsx';
import { ExamFormModal } from '../components/exams/ExamFormModal.jsx';
import { formatDate } from '../utils/dateUtils.js';
import {
  ArrowLeft,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';

export const ExamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: exam, isLoading, isError, error } = useExam(id);
  const updateExamMutation = useUpdateExam();
  const deleteExamMutation = useDeleteExam();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [filter, setFilter] = useState('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
  const [isDeleteExamDialogOpen, setIsDeleteExamDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <SkeletonCard height="50px" count={1} />
        <SkeletonCard height="200px" count={1} />
        <SkeletonCard height="70px" count={3} />
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <div style={{ padding: '48px 24px', maxWidth: '600px', margin: '0 auto' }}>
        <EmptyState
          icon={BookOpen}
          title="Exam Not Found"
          description={error?.message || `Exam with ID #${id} does not exist or has been removed.`}
          actionLabel="Back to Exams"
          onAction={() => navigate('/exams')}
        />
      </div>
    );
  }

  const tasks = exam.tasks || [];

  // Filter tasks based on selected tab
  const now = new Date();
  const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.done;
    if (filter === 'completed') return t.done;
    if (filter === 'today') {
      const taskDateStr = new Date(t.plannedDate).toISOString().split('T')[0];
      return taskDateStr === todayStr;
    }
    if (filter === 'upcoming') {
      const taskDate = new Date(t.plannedDate);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return !t.done && taskDate >= todayStart;
    }
    return true; // 'all'
  });

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => !t.done).length,
    completed: tasks.filter((t) => t.done).length,
    today: tasks.filter((t) => new Date(t.plannedDate).toISOString().split('T')[0] === todayStr).length,
    upcoming: tasks.filter((t) => !t.done && new Date(t.plannedDate) >= new Date(now.getFullYear(), now.getMonth(), now.getDate())).length,
  };

  const handleCreateTask = async (taskData) => {
    await createTaskMutation.mutateAsync({
      examId: exam.id,
      data: taskData,
    });
    setIsTaskModalOpen(false);
  };

  const handleUpdateTask = async (taskData) => {
    if (!editingTask) return;
    await updateTaskMutation.mutateAsync({
      id: editingTask.id,
      data: taskData,
    });
    setEditingTask(null);
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    await deleteTaskMutation.mutateAsync(deletingTask.id);
    setDeletingTask(null);
  };

  const handleUpdateExam = async (examData) => {
    await updateExamMutation.mutateAsync({
      id: exam.id,
      data: examData,
    });
    setIsEditExamModalOpen(false);
  };

  const handleDeleteExam = async () => {
    await deleteExamMutation.mutateAsync(exam.id);
    navigate('/exams');
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Back Breadcrumb */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/exams"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Exams</span>
        </Link>
      </div>

      {/* Main Exam Header Banner */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <CountdownBadge examDate={exam.examDate} />
              <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 600 }}>
                ID #{exam.id}
              </span>
            </div>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                marginBottom: '6px',
              }}
            >
              {exam.subject}
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}
            >
              <Calendar size={16} color="var(--primary)" />
              <span>
                Exam Date: <strong>{formatDate(exam.examDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsEditExamModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: '#ffffff',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <Edit3 size={15} />
              <span>Edit Exam</span>
            </button>
            <button
              onClick={() => setIsDeleteExamDialogOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--danger-light)',
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '20px' }}>
          <ProgressBar progress={exam.progress} height={10} />
        </div>

        {/* Task Counters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-light)',
            fontSize: '13px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <BookOpen size={16} color="var(--primary)" />
            Total: <strong>{exam.totalTasks}</strong> topics
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-text)' }}>
            <CheckCircle2 size={16} color="var(--success)" />
            Completed: <strong>{exam.completedTasks}</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--warning-text)' }}>
            <Clock size={16} color="var(--warning)" />
            Pending: <strong>{exam.pendingTasks}</strong>
          </span>
        </div>
      </div>

      {/* Task Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <TaskFilters currentFilter={filter} onFilterChange={setFilter} counts={counts} />

        <button
          onClick={() => setIsTaskModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 700,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Plus size={16} />
          <span>Add Study Task</span>
        </button>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={
            tasks.length === 0
              ? 'No study tasks created yet'
              : `No ${filter} tasks found`
          }
          description={
            tasks.length === 0
              ? 'Break down your exam syllabus into manageable daily study tasks.'
              : `There are currently no tasks matching the "${filter}" filter.`
          }
          actionLabel={tasks.length === 0 ? 'Add First Topic' : undefined}
          onAction={tasks.length === 0 ? () => setIsTaskModalOpen(true) : undefined}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={(t) => setEditingTask(t)}
              onDelete={(t) => setDeletingTask(t)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        exams={[exam]}
        defaultExamId={exam.id}
        isLoading={createTaskMutation.isPending}
      />

      <TaskFormModal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
        initialData={editingTask}
        exams={[exam]}
        defaultExamId={exam.id}
        isLoading={updateTaskMutation.isPending}
      />

      <ExamFormModal
        isOpen={isEditExamModalOpen}
        onClose={() => setIsEditExamModalOpen(false)}
        onSubmit={handleUpdateExam}
        initialData={exam}
        isLoading={updateExamMutation.isPending}
      />

      <ConfirmDialog
        isOpen={isDeleteExamDialogOpen}
        onClose={() => setIsDeleteExamDialogOpen(false)}
        onConfirm={handleDeleteExam}
        title={`Delete Exam: "${exam.subject}"?`}
        message="Deleting this exam will automatically remove all associated tasks and preparation data."
        isLoading={deleteExamMutation.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        title={`Delete Task: "${deletingTask?.title}"?`}
        message="Are you sure you want to remove this study task from your schedule?"
        isLoading={deleteTaskMutation.isPending}
      />
    </div>
  );
};

export default ExamDetailPage;
