import React from 'react';
import { Menu, Plus, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils.js';

export const Navbar = ({ onToggleMobile, onQuickAddTask, onNewExam }) => {
  const todayStr = formatDate(new Date(), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 800,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleMobile}
          className="mobile-menu-btn"
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          <Calendar size={16} color="var(--primary)" />
          <span>Today: <strong>{todayStr}</strong></span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {onQuickAddTask && (
          <button
            onClick={onQuickAddTask}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary-dark)',
              border: '1px solid #c7d2fe',
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <Plus size={16} />
            <span className="btn-text">Quick Add Task</span>
          </button>
        )}

        {onNewExam && (
          <button
            onClick={onNewExam}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '7px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Plus size={16} />
            <span className="btn-text">New Exam</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
