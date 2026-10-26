import React from 'react';
import { useToggleTask } from '../../hooks/useToggleTask.js';
import { formatDate, formatMinutes } from '../../utils/dateUtils.js';
import { Calendar, Clock, Edit3, Trash2, Check } from 'lucide-react';

export const TaskItem = ({ task, onEdit, onDelete, showExam = false }) => {
  const toggleMutation = useToggleTask();

  const handleToggle = () => {
    toggleMutation.mutate({
      taskId: task.id,
      currentDone: task.done,
      examId: task.examId,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        backgroundColor: task.done ? '#f8fafc' : '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid',
        borderColor: task.done ? '#e2e8f0' : '#cbd5e1',
        boxShadow: task.done ? 'none' : 'var(--shadow-sm)',
        transition: 'all var(--transition-fast)',
        gap: '12px',
      }}
    >
      {/* Checkbox and Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        <button
          type="button"
          role="checkbox"
          aria-checked={task.done}
          onClick={handleToggle}
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            border: `2px solid ${task.done ? 'var(--success)' : '#94a3b8'}`,
            backgroundColor: task.done ? 'var(--success)' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          aria-label={`Mark "${task.title}" as ${task.done ? 'pending' : 'completed'}`}
        >
          {task.done && <Check size={14} strokeWidth={3} />}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: task.done ? 'var(--text-light)' : 'var(--text-main)',
              textDecoration: task.done ? 'line-through' : 'none',
              lineHeight: 1.3,
              wordBreak: 'break-word',
            }}
          >
            {task.title}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            {showExam && task.exam && (
              <span
                style={{
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-dark)',
                  padding: '1px 8px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {task.exam.subject}
              </span>
            )}

            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} color="var(--primary)" />
              {formatDate(task.plannedDate, { month: 'short', day: 'numeric' })}
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} color="#f59e0b" />
              {formatMinutes(task.minutes)}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-light)',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Edit Task"
          >
            <Edit3 size={15} />
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(task)}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Delete Task"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
