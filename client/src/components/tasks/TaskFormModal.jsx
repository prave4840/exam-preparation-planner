import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { toInputDateFormat } from '../../utils/dateUtils.js';

export const TaskFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  exams = [],
  defaultExamId = null,
  isLoading = false,
}) => {
  const [examId, setExamId] = useState('');
  const [title, setTitle] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [minutes, setMinutes] = useState(60);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setExamId(initialData.examId ? String(initialData.examId) : '');
      setTitle(initialData.title || '');
      setPlannedDate(initialData.plannedDate ? toInputDateFormat(initialData.plannedDate) : '');
      setMinutes(initialData.minutes || 60);
    } else {
      setExamId(defaultExamId ? String(defaultExamId) : exams.length > 0 ? String(exams[0].id) : '');
      setTitle('');
      setPlannedDate(toInputDateFormat(new Date()));
      setMinutes(60);
    }
    setErrors({});
  }, [initialData, defaultExamId, exams, isOpen]);

  // Find currently selected exam to check its examDate
  const selectedExam = exams.find((e) => String(e.id) === String(examId));
  const maxPlannedDate = selectedExam ? toInputDateFormat(selectedExam.examDate) : undefined;

  const validate = () => {
    const newErrors = {};

    if (!examId) {
      newErrors.examId = 'Please select an associated exam';
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Task title / topic is required';
    } else if (trimmedTitle.length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (trimmedTitle.length > 150) {
      newErrors.title = 'Title cannot exceed 150 characters';
    }

    if (!plannedDate) {
      newErrors.plannedDate = 'Planned date is required';
    } else if (selectedExam && maxPlannedDate) {
      if (plannedDate > maxPlannedDate) {
        newErrors.plannedDate = `Planned task date cannot be after its exam date (${maxPlannedDate})`;
      }
    }

    const parsedMinutes = Number(minutes);
    if (!parsedMinutes || isNaN(parsedMinutes)) {
      newErrors.minutes = 'Duration in minutes is required';
    } else if (parsedMinutes < 15 || parsedMinutes > 480) {
      newErrors.minutes = 'Study duration must be between 15 and 480 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const [year, month, day] = plannedDate.split('-');
    const isoPlannedDate = new Date(year, month - 1, day, 10, 0, 0).toISOString();

    onSubmit({
      examId: parseInt(examId, 10),
      title: title.trim(),
      plannedDate: isoPlannedDate,
      minutes: parseInt(minutes, 10),
    });
  };

  const durationPresets = [30, 45, 60, 90, 120, 180];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Study Task' : 'Add Study Task'}
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Exam Selection (if not locked to defaultExamId with no alternatives) */}
        <div>
          <label
            htmlFor="task-exam"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '6px',
            }}
          >
            Target Exam <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <select
            id="task-exam"
            value={examId}
            onChange={(e) => {
              setExamId(e.target.value);
              if (errors.examId) setErrors((prev) => ({ ...prev, examId: null }));
            }}
            disabled={isLoading || (initialData && defaultExamId)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${errors.examId ? 'var(--danger)' : 'var(--border-color)'}`,
              fontSize: '14px',
              color: 'var(--text-main)',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="" disabled>
              Select Exam
            </option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.subject} ({toInputDateFormat(exam.examDate)})
              </option>
            ))}
          </select>
          {errors.examId && (
            <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>
              {errors.examId}
            </p>
          )}
        </div>

        {/* Task Title */}
        <div>
          <label
            htmlFor="task-title"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '6px',
            }}
          >
            Topic / Task Title <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            id="task-title"
            type="text"
            placeholder="e.g. Normalization & BCNF Practice"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${errors.title ? 'var(--danger)' : 'var(--border-color)'}`,
              fontSize: '14px',
              color: 'var(--text-main)',
              backgroundColor: '#ffffff',
            }}
          />
          {errors.title && (
            <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>
              {errors.title}
            </p>
          )}
        </div>

        {/* Planned Date */}
        <div>
          <label
            htmlFor="task-planned-date"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '6px',
            }}
          >
            Planned Study Date <span style={{ color: 'var(--danger)' }}>*</span>
            {maxPlannedDate && (
              <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '12px', marginLeft: '6px' }}>
                (Must be on or before exam: {maxPlannedDate})
              </span>
            )}
          </label>
          <input
            id="task-planned-date"
            type="date"
            max={maxPlannedDate}
            value={plannedDate}
            onChange={(e) => {
              setPlannedDate(e.target.value);
              if (errors.plannedDate) setErrors((prev) => ({ ...prev, plannedDate: null }));
            }}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${errors.plannedDate ? 'var(--danger)' : 'var(--border-color)'}`,
              fontSize: '14px',
              color: 'var(--text-main)',
              backgroundColor: '#ffffff',
            }}
          />
          {errors.plannedDate && (
            <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>
              {errors.plannedDate}
            </p>
          )}
        </div>

        {/* Study Duration */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label
              htmlFor="task-minutes"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-main)',
              }}
            >
              Planned Duration (Minutes) <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              15 to 480 mins
            </span>
          </div>
          <input
            id="task-minutes"
            type="number"
            min={15}
            max={480}
            step={5}
            value={minutes}
            onChange={(e) => {
              setMinutes(e.target.value);
              if (errors.minutes) setErrors((prev) => ({ ...prev, minutes: null }));
            }}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${errors.minutes ? 'var(--danger)' : 'var(--border-color)'}`,
              fontSize: '14px',
              color: 'var(--text-main)',
              backgroundColor: '#ffffff',
            }}
          />

          {/* Quick preset buttons */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
            {durationPresets.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: Number(minutes) === m ? 'var(--primary)' : 'var(--border-color)',
                  backgroundColor: Number(minutes) === m ? 'var(--primary-light)' : '#ffffff',
                  color: Number(minutes) === m ? 'var(--primary-dark)' : 'var(--text-muted)',
                }}
              >
                {m}m
              </button>
            ))}
          </div>

          {errors.minutes && (
            <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>
              {errors.minutes}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
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
            {isLoading ? 'Saving...' : initialData ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;
