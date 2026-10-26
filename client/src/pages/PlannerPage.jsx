import React, { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks.js';
import { useExams } from '../hooks/useExams.js';
import { TaskItem } from '../components/tasks/TaskItem.jsx';
import { TaskFormModal } from '../components/tasks/TaskFormModal.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { SkeletonCard } from '../components/common/SkeletonCard.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { formatDate } from '../utils/dateUtils.js';
import { CalendarDays, Plus, Filter, Sparkles, CheckCircle2 } from 'lucide-react';

export const PlannerPage = () => {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: exams = [] } = useExams();

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [selectedExamId, setSelectedExamId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const handleCreateTask = async (taskData) => {
    await createTaskMutation.mutateAsync({
      examId: taskData.examId,
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

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedExamId && String(task.examId) !== selectedExamId) return false;
    if (statusFilter === 'pending') return !task.done;
    if (statusFilter === 'completed') return task.done;
    return true;
  });

  // Group tasks chronologically
  const now = new Date();
  const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()).toISOString().split('T')[0];

  const groups = {
    today: [],
    tomorrow: [],
    upcoming: [],
    past: [],
  };

  filteredTasks.forEach((task) => {
    const taskDateStr = new Date(task.plannedDate).toISOString().split('T')[0];
    if (taskDateStr === todayStr) {
      groups.today.push(task);
    } else if (taskDateStr === tomorrowStr) {
      groups.tomorrow.push(task);
    } else if (taskDateStr > tomorrowStr) {
      groups.upcoming.push(task);
    } else {
      groups.past.push(task);
    }
  });

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            Study Planner
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Chronological timeline of your scheduled study sessions and exam preparation.
          </p>
        </div>

        <button
          onClick={() => setIsTaskModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            padding: '9px 18px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: 700,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Plus size={18} />
          <span>Add Study Task</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '28px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={16} color="var(--primary)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Filter:</span>
          </div>

          {/* Exam Filter Dropdown */}
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              fontSize: '13px',
              color: 'var(--text-main)',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="">All Subjects</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.subject}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['all', 'pending', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: statusFilter === status ? 'var(--primary-subtle)' : 'transparent',
                  color: statusFilter === status ? 'var(--primary-dark)' : 'var(--text-muted)',
                  border: `1px solid ${statusFilter === status ? '#c7d2fe' : 'transparent'}`,
                  textTransform: 'capitalize',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredTasks.length}</strong> tasks
        </span>
      </div>

      {/* Content Timeline */}
      {isLoading ? (
        <SkeletonCard height="90px" count={4} />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No study tasks scheduled"
          description="Plan your study schedule by scheduling topics across your upcoming exams."
          actionLabel="Schedule Study Task"
          onAction={() => setIsTaskModalOpen(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Group 1: Today */}
          {groups.today.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                  }}
                >
                  Today
                </span>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {formatDate(new Date(), { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {groups.today.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    showExam={true}
                    onEdit={(t) => setEditingTask(t)}
                    onDelete={(t) => setDeletingTask(t)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group 2: Tomorrow */}
          {groups.tomorrow.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    backgroundColor: 'var(--secondary)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                  }}
                >
                  Tomorrow
                </span>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {formatDate(tomorrow, { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {groups.tomorrow.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    showExam={true}
                    onEdit={(t) => setEditingTask(t)}
                    onDelete={(t) => setDeletingTask(t)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group 3: Upcoming Later */}
          {groups.upcoming.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '12px',
                }}
              >
                Upcoming Study Sessions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {groups.upcoming.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    showExam={true}
                    onEdit={(t) => setEditingTask(t)}
                    onDelete={(t) => setDeletingTask(t)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group 4: Past Tasks */}
          {groups.past.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--text-light)',
                  marginBottom: '12px',
                }}
              >
                Past Scheduled Tasks
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {groups.past.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    showExam={true}
                    onEdit={(t) => setEditingTask(t)}
                    onDelete={(t) => setDeletingTask(t)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        exams={exams}
        defaultExamId={selectedExamId || null}
        isLoading={createTaskMutation.isPending}
      />

      <TaskFormModal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
        initialData={editingTask}
        exams={exams}
        isLoading={updateTaskMutation.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        title={`Delete Task: "${deletingTask?.title}"?`}
        message="Are you sure you want to delete this study task?"
        isLoading={deleteTaskMutation.isPending}
      />
    </div>
  );
};

export default PlannerPage;
