import React, { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks.js';
import { useExams } from '../hooks/useExams.js';
import { TaskItem } from '../components/tasks/TaskItem.jsx';
import { TaskFilters } from '../components/tasks/TaskFilters.jsx';
import { TaskFormModal } from '../components/tasks/TaskFormModal.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { SkeletonCard } from '../components/common/SkeletonCard.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { CheckSquare, Plus, Search, Filter } from 'lucide-react';

export const TasksPage = () => {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: exams = [] } = useExams();

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [filter, setFilter] = useState('all');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const now = new Date();
  const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];

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

  // Base list filtered by exam if selected
  const examFilteredTasks = selectedExamId
    ? tasks.filter((t) => String(t.examId) === selectedExamId)
    : tasks;

  // Compute counts for filter tabs
  const counts = {
    all: examFilteredTasks.length,
    pending: examFilteredTasks.filter((t) => !t.done).length,
    completed: examFilteredTasks.filter((t) => t.done).length,
    today: examFilteredTasks.filter((t) => new Date(t.plannedDate).toISOString().split('T')[0] === todayStr).length,
    upcoming: examFilteredTasks.filter((t) => !t.done && new Date(t.plannedDate) >= new Date(now.getFullYear(), now.getMonth(), now.getDate())).length,
  };

  // Filter tasks based on tab & search term
  const displayedTasks = examFilteredTasks.filter((task) => {
    // Search match
    if (searchTerm.trim() && !task.title.toLowerCase().includes(searchTerm.toLowerCase().trim())) {
      return false;
    }

    if (filter === 'pending') return !task.done;
    if (filter === 'completed') return task.done;
    if (filter === 'today') {
      const taskDateStr = new Date(task.plannedDate).toISOString().split('T')[0];
      return taskDateStr === todayStr;
    }
    if (filter === 'upcoming') {
      const taskDate = new Date(task.plannedDate);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return !task.done && taskDate >= todayStart;
    }
    return true; // 'all'
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
            Study Tasks
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Complete syllabus topics, track study hours, and monitor daily progress.
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

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <TaskFilters currentFilter={filter} onFilterChange={setFilter} counts={counts} />

          {/* Exam dropdown filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Subject:
            </span>
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
          </div>
        </div>

        {/* Search input */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Search size={16} color="var(--text-light)" />
          <input
            type="text"
            placeholder="Search tasks by topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: 'var(--text-main)',
              width: '100%',
              backgroundColor: 'transparent',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <SkeletonCard height="70px" count={4} />
      ) : displayedTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={
            searchTerm
              ? 'No matching tasks found'
              : filter !== 'all'
              ? `No ${filter} tasks found`
              : 'No study tasks yet'
          }
          description={
            searchTerm
              ? `No tasks matching "${searchTerm}". Try a different keyword.`
              : 'Add your first syllabus topic and start checking off your study goals.'
          }
          actionLabel={searchTerm ? 'Clear Search' : 'Add First Task'}
          onAction={searchTerm ? () => setSearchTerm('') : () => setIsTaskModalOpen(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              showExam={true}
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

export default TasksPage;
