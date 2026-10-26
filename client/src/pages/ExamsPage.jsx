import React, { useState } from 'react';
import { useExams, useCreateExam, useUpdateExam, useDeleteExam } from '../hooks/useExams.js';
import { ExamCard } from '../components/exams/ExamCard.jsx';
import { ExamFormModal } from '../components/exams/ExamFormModal.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { SkeletonCard } from '../components/common/SkeletonCard.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Plus, Search, GraduationCap } from 'lucide-react';

export const ExamsPage = () => {
  const { data: exams = [], isLoading } = useExams();
  const createExamMutation = useCreateExam();
  const updateExamMutation = useUpdateExam();
  const deleteExamMutation = useDeleteExam();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deletingExam, setDeletingExam] = useState(null);

  const handleCreateExam = async (formData) => {
    await createExamMutation.mutateAsync(formData);
    setIsCreateModalOpen(false);
  };

  const handleUpdateExam = async (formData) => {
    if (!editingExam) return;
    await updateExamMutation.mutateAsync({
      id: editingExam.id,
      data: formData,
    });
    setEditingExam(null);
  };

  const handleDeleteExam = async () => {
    if (!deletingExam) return;
    await deleteExamMutation.mutateAsync(deletingExam.id);
    setDeletingExam(null);
  };

  const filteredExams = exams.filter((exam) =>
    exam.subject.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
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
            Exam Management
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Schedule and oversee your upcoming course exams and syllabus readiness.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            padding: '9px 20px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: 700,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Plus size={18} />
          <span>Add New Exam</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Search size={18} color="var(--text-light)" />
        <input
          type="text"
          placeholder="Search exams by subject name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '14px',
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

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          <SkeletonCard height="220px" count={3} />
        </div>
      ) : filteredExams.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={searchTerm ? 'No exams match your search' : 'No exams yet'}
          description={
            searchTerm
              ? `No exams found matching "${searchTerm}". Try another search term.`
              : 'Add your first semester or certification exam to organize your study plan.'
          }
          actionLabel={searchTerm ? 'Clear Search' : 'Add First Exam'}
          onAction={searchTerm ? () => setSearchTerm('') : () => setIsCreateModalOpen(true)}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onEdit={(e) => setEditingExam(e)}
              onDelete={(e) => setDeletingExam(e)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ExamFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateExam}
        isLoading={createExamMutation.isPending}
      />

      <ExamFormModal
        isOpen={Boolean(editingExam)}
        onClose={() => setEditingExam(null)}
        onSubmit={handleUpdateExam}
        initialData={editingExam}
        isLoading={updateExamMutation.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingExam)}
        onClose={() => setDeletingExam(null)}
        onConfirm={handleDeleteExam}
        title={`Delete Exam: "${deletingExam?.subject}"?`}
        message="Deleting this exam will automatically delete all associated study tasks. This action cannot be reversed."
        isLoading={deleteExamMutation.isPending}
      />
    </div>
  );
};

export default ExamsPage;
