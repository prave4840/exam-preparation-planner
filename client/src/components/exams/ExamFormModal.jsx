import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { toInputDateFormat } from '../../utils/dateUtils.js';

export const ExamFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setSubject(initialData.subject || '');
      setExamDate(initialData.examDate ? toInputDateFormat(initialData.examDate) : '');
    } else {
      setSubject('');
      // Default to 14 days from today
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      setExamDate(toInputDateFormat(defaultDate));
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {};
    const trimmedSubject = subject.trim();

    if (!trimmedSubject) {
      newErrors.subject = 'Subject name is required';
    } else if (trimmedSubject.length < 2) {
      newErrors.subject = 'Subject name must be at least 2 characters';
    } else if (trimmedSubject.length > 100) {
      newErrors.subject = 'Subject name cannot exceed 100 characters';
    }

    if (!examDate) {
      newErrors.examDate = 'Exam date is required';
    } else {
      const selectedDate = new Date(examDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      // Only enforce future date when creating new exam or changing date
      if (!initialData && selectedDate < today) {
        newErrors.examDate = 'Exam date must not be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Send ISO string at start of the day
    const [year, month, day] = examDate.split('-');
    const isoDate = new Date(year, month - 1, day, 9, 0, 0).toISOString();

    onSubmit({
      subject: subject.trim(),
      examDate: isoDate,
    });
  };

  const todayStr = toInputDateFormat(new Date());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Exam Details' : 'Add New Exam'}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Subject input */}
        <div>
          <label
            htmlFor="exam-subject"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '6px',
            }}
          >
            Subject Name <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            id="exam-subject"
            type="text"
            placeholder="e.g. Database Management Systems"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors((prev) => ({ ...prev, subject: null }));
            }}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${errors.subject ? 'var(--danger)' : 'var(--border-color)'}`,
              fontSize: '14px',
              color: 'var(--text-main)',
              backgroundColor: '#ffffff',
            }}
          />
          {errors.subject && (
            <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>
              {errors.subject}
            </p>
          )}
        </div>

        {/* Exam Date input */}
        <div>
          <label
            htmlFor="exam-date"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '6px',
            }}
          >
            Exam Date <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            id="exam-date"
            type="date"
            min={todayStr}
            value={examDate}
            onChange={(e) => {
              setExamDate(e.target.value);
              if (errors.examDate) setErrors((prev) => ({ ...prev, examDate: null }));
            }}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${errors.examDate ? 'var(--danger)' : 'var(--border-color)'}`,
              fontSize: '14px',
              color: 'var(--text-main)',
              backgroundColor: '#ffffff',
            }}
          />
          {errors.examDate && (
            <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>
              {errors.examDate}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '10px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '9px 18px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '9px 22px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Exam' : 'Create Exam'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExamFormModal;
