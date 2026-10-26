import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CountdownBadge } from '../common/CountdownBadge.jsx';
import { ProgressBar } from '../common/ProgressBar.jsx';
import { formatDate } from '../../utils/dateUtils.js';
import { Calendar, CheckCircle2, Clock, Edit3, Trash2, ArrowRight } from 'lucide-react';

export const ExamCard = ({ exam, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        transition: 'all var(--transition-fast)',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = '#c7d2fe';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '10px',
          }}
        >
          <h3
            onClick={() => navigate(`/exams/${exam.id}`)}
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.01em',
              cursor: 'pointer',
              lineHeight: 1.3,
            }}
          >
            {exam.subject}
          </h3>
          <CountdownBadge examDate={exam.examDate} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '14px',
          }}
        >
          <Calendar size={14} color="var(--primary)" />
          <span>{formatDate(exam.examDate, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {/* Progress Bar */}
        <ProgressBar progress={exam.progress} height={8} />

        {/* Quick Task Stats Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '14px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} color="var(--success)" />
            <strong>{exam.completedTasks || 0}</strong> completed
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} color="var(--warning)" />
            <strong>{exam.pendingTasks || 0}</strong> pending
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => navigate(`/exams/${exam.id}`)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--primary)',
          }}
        >
          <span>View Study Plan</span>
          <ArrowRight size={14} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onEdit && (
            <button
              onClick={() => onEdit(exam)}
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Edit Exam"
            >
              <Edit3 size={15} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(exam)}
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Delete Exam"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamCard;
