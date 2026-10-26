import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  CalendarDays,
  CheckSquare,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard.js';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { data: dashboardData } = useDashboard();
  const nearest = dashboardData?.nearestExam;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Exams', path: '/exams', icon: GraduationCap },
    { name: 'Study Planner', path: '/planner', icon: CalendarDays },
    { name: 'All Tasks', path: '/tasks', icon: CheckSquare },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 900,
          }}
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 950,
          transition: 'transform 0.3s ease',
          ...(isMobileOpen
            ? {
                position: 'fixed',
                transform: 'translateX(0)',
                left: 0,
                boxShadow: 'var(--shadow-xl)',
              }
            : {}),
        }}
        className={isMobileOpen ? '' : 'desktop-sidebar'}
      >
        {/* Brand Logo Header */}
        <div
          style={{
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '17px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-main)',
                lineHeight: 1.2,
              }}
            >
              ExamReady
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Preparation Planner
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            padding: '20px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0 12px 6px',
            }}
          >
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                })}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Upcoming Exam Banner */}
        {nearest && (
          <div style={{ padding: '16px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                border: '1px solid #ddd6fe',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color="var(--primary)" />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--primary-dark)',
                    letterSpacing: '0.04em',
                  }}
                >
                  Next Target Exam
                </span>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {nearest.subject}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Countdown</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: nearest.daysRemaining <= 3 ? 'var(--danger-text)' : 'var(--primary-dark)',
                  }}
                >
                  {nearest.daysRemaining === 0 ? 'Today!' : `${nearest.daysRemaining} days left`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-light)',
          }}
        >
          <span>ExamReady v1.0</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={13} /> College Project
          </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
