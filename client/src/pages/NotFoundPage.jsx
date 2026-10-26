import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <GraduationCap size={36} />
      </div>

      <h1
        style={{
          fontSize: '48px',
          fontWeight: 800,
          color: 'var(--primary-dark)',
          letterSpacing: '-0.03em',
          marginBottom: '8px',
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '8px',
        }}
      >
        Page Not Found
      </h2>

      <p
        style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          maxWidth: '400px',
          lineHeight: 1.5,
          marginBottom: '24px',
        }}
      >
        The page you are looking for does not exist or may have been relocated. Let's get you back on track with your study plan.
      </p>

      <button
        onClick={() => navigate('/')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          padding: '10px 22px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '14px',
          fontWeight: 700,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <ArrowLeft size={16} />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};

export default NotFoundPage;
