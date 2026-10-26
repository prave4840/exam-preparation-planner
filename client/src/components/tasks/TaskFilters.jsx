import React from 'react';

export const TaskFilters = ({ currentFilter, onFilterChange, counts = {} }) => {
  const filters = [
    { key: 'all', label: 'All Tasks', count: counts.all },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'completed', label: 'Completed', count: counts.completed },
    { key: 'today', label: "Today's Tasks", count: counts.today },
    { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}
    >
      {filters.map((f) => {
        const isActive = currentFilter === f.key;
        return (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: isActive ? 700 : 500,
              backgroundColor: isActive ? 'var(--primary)' : '#ffffff',
              color: isActive ? '#ffffff' : 'var(--text-muted)',
              border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`,
              whiteSpace: 'nowrap',
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            <span>{f.label}</span>
            {f.count !== undefined && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-muted)',
                  color: isActive ? '#ffffff' : 'var(--text-light)',
                }}
              >
                {f.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TaskFilters;
