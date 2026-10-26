import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/common/Sidebar.jsx';
import { Navbar } from './components/common/Navbar.jsx';
import { ToastContainer } from './components/common/ToastContainer.jsx';
import { TaskFormModal } from './components/tasks/TaskFormModal.jsx';
import { ExamFormModal } from './components/exams/ExamFormModal.jsx';
import { useExams, useCreateExam } from './hooks/useExams.js';
import { useCreateTask } from './hooks/useTasks.js';

import { DashboardPage } from './pages/DashboardPage.jsx';
import { ExamsPage } from './pages/ExamsPage.jsx';
import { ExamDetailPage } from './pages/ExamDetailPage.jsx';
import { PlannerPage } from './pages/PlannerPage.jsx';
import { TasksPage } from './pages/TasksPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

export const App = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [isQuickExamOpen, setIsQuickExamOpen] = useState(false);

  const { data: exams = [] } = useExams();
  const createTaskMutation = useCreateTask();
  const createExamMutation = useCreateExam();

  const handleQuickCreateTask = async (taskData) => {
    await createTaskMutation.mutateAsync({
      examId: taskData.examId,
      data: taskData,
    });
    setIsQuickTaskOpen(false);
  };

  const handleQuickCreateExam = async (examData) => {
    await createExamMutation.mutateAsync(examData);
    setIsQuickExamOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        <Navbar
          onToggleMobile={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onQuickAddTask={() => setIsQuickTaskOpen(true)}
          onNewExam={() => setIsQuickExamOpen(true)}
        />

        {/* Page Routes */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/exams" element={<ExamsPage />} />
            <Route path="/exams/:id" element={<ExamDetailPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      {/* Global Toast System */}
      <ToastContainer />

      {/* Global Quick Action Modals */}
      <TaskFormModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
        onSubmit={handleQuickCreateTask}
        exams={exams}
        isLoading={createTaskMutation.isPending}
      />

      <ExamFormModal
        isOpen={isQuickExamOpen}
        onClose={() => setIsQuickExamOpen(false)}
        onSubmit={handleQuickCreateExam}
        isLoading={createExamMutation.isPending}
      />
    </div>
  );
};

export default App;
