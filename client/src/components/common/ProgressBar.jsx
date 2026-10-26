import React from 'react';

export const ProgressBar = ({ progress = 0, showLabel = true, height = 8, animate = true }) => {
  const clamped = Math.min(100, Math.max(0, Number(progress) || 0));

  // Determine dynamic gradient based on progress level
  let gradient = 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)';
  if (clamped === 100) {
    gradient = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
  } else if (clamped < 25) {
    gradient = 'linear-gradient(90deg, #818cf8 0%, #6366f1 100%)';
  }

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}
        >
          <span>Preparation Progress</span>
          <span style={{ color: clamped === 100 ? 'var(--success-text)' : 'var(--primary-dark)' }}>
            {clamped}%
          </span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: '#e2e8f0',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
        }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            background: gradient,
            borderRadius: '9999px',
            transition: animate ? 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
