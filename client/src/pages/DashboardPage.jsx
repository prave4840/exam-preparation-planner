import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard.js';
import { useExams, useCreateExam } from '../hooks/useExams.js';
import { useCreateTask } from '../hooks/useTasks.js';
import { ProgressBar } from '../components/common/ProgressBar.jsx';
import { CountdownBadge } from '../components/common/CountdownBadge.jsx';
import { SkeletonCard } from '../components/common/SkeletonCard.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { TaskItem } from '../components/tasks/TaskItem.jsx';
import { TaskFormModal } from '../components/tasks/TaskFormModal.jsx';
import { ExamFormModal } from '../components/exams/ExamFormModal.jsx';
import { formatDate } from '../utils/dateUtils.js';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, isError, error } = useDashboard();
  const { data: exams = [] } = useExams();

  const createTaskMutation = useCreateTask();
  const createExamMutation = useCreateExam();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  const handleCreateTask = async (taskData) => {
    await createTaskMutation.mutateAsync({
      examId: taskData.examId,
      data: taskData,
    });
    setIsTaskModalOpen(false);
  };

  const handleCreateExam = async (examData) => {
    await createExamMutation.mutateAsync(examData);
    setIsExamModalOpen(false);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <SkeletonCard height="80px" count={1} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', margin: '24px 0' }}>
          <SkeletonCard height="110px" count={4} />
        </div>
        <SkeletonCard height="240px" count={2} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '48px 24px', maxWidth: '600px', margin: '0 auto' }}>
        <EmptyState
          icon={AlertCircle}
          title="Failed to Load Dashboard"
          description={error?.message || 'Could not connect to the backend server. Make sure PostgreSQL and the API are running.'}
        />
      </div>
    );
  }

  const {
    upcomingExamsCount = 0,
    totalTasks = 0,
    completedTasks = 0,
    pendingTasks = 0,
    overallPreparationPercentage = 0,
    nearestExam = null,
    subjectProgress = [],
    todayTasks = [],
  } = dashboardData || {};

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
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
            Study Dashboard
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Track your exam countdowns, syllabus progress, and daily tasks in one place.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary-dark)',
              border: '1px solid #c7d2fe',
              padding: '9px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            <Plus size={16} />
            <span>Add Study Task</span>
          </button>
          <button
            onClick={() => setIsExamModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '9px 18px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Plus size={16} />
            <span>New Exam</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {/* Metric 1: Upcoming Exams */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Upcoming Exams
            </span>
            <p style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {upcomingExamsCount}
            </p>
          </div>
        </div>

        {/* Metric 2: Overall Progress */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--secondary-light)',
              color: 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Overall Preparation
            </span>
            <p style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {overallPreparationPercentage}%
            </p>
          </div>
        </div>

        {/* Metric 3: Completed Tasks */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--success-light)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Completed Tasks
            </span>
            <p style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {completedTasks}
            </p>
          </div>
        </div>

        {/* Metric 4: Pending Tasks */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--warning-light)',
              color: 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Pending Tasks
            </span>
            <p style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {pendingTasks}
            </p>
          </div>
        </div>
      </div>

      {/* Nearest Target Exam Countdown Spotlight */}
      {nearestExam && (
        <div
          style={{
            background: 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 100%)',
            border: '1px solid #c7d2fe',
            borderRadius: 'var(--radius-lg)',
            padding: '22px 24px',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              }}
            >
              <Sparkles size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--primary-dark)',
                    letterSpacing: '0.04em',
                  }}
                >
                  Nearest Upcoming Exam
                </span>
                <CountdownBadge examDate={nearestExam.examDate} size="sm" />
              </div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  letterSpacing: '-0.01em',
                }}
              >
                {nearestExam.subject}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Scheduled for {formatDate(nearestExam.examDate, { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div style={{ minWidth: '220px', flex: '0 1 300px' }}>
            <div style={{ marginBottom: '8px' }}>
              <ProgressBar progress={nearestExam.progress} height={10} />
            </div>
            <button
              onClick={() => navigate(`/exams/${nearestExam.id}`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--primary-dark)',
              }}
            >
              <span>View Exam Preparation Plan</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main Two-Column Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Left Column: Subject-Wise Progress */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
                Subject-Wise Progress
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Completion across all enrolled subjects
              </p>
            </div>

            <button
              onClick={() => navigate('/exams')}
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {subjectProgress.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No exams scheduled"
              description="Create your first exam to begin tracking preparation progress."
              actionLabel="Add Exam"
              onAction={() => setIsExamModalOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {subjectProgress.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => navigate(`/exams/${subject.id}`)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#c7d2fe';
                    e.currentTarget.style.backgroundColor = '#fdfdfe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {subject.subject}
                    </span>
                    <CountdownBadge examDate={subject.examDate} size="sm" />
                  </div>

                  <ProgressBar progress={subject.progress} height={7} />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginTop: '8px',
                    }}
                  >
                    <span>
                      {subject.completedTasks} / {subject.totalTasks} tasks completed
                    </span>
                    <span>
                      {formatDate(subject.examDate, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Today's Study Tasks */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
                Today's Study Tasks
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Tasks scheduled for immediate review
              </p>
            </div>

            <button
              onClick={() => setIsTaskModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary-dark)',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No tasks scheduled for today"
              description="Keep up your momentum! Schedule a study topic for today."
              actionLabel="Add Study Task"
              onAction={() => setIsTaskModalOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todayTasks.map((task) => (
                <TaskItem key={task.id} task={task} showExam={true} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        exams={exams}
        isLoading={createTaskMutation.isPending}
      />

      <ExamFormModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        onSubmit={handleCreateExam}
        isLoading={createExamMutation.isPending}
      />
    </div>
  );
};

export default DashboardPage;
