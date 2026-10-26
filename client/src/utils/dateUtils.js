export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  };
  return date.toLocaleDateString('en-US', defaultOptions);
};

export const formatMinutes = (minutes) => {
  if (!minutes) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
};

export const calculateDaysRemaining = (targetDate) => {
  if (!targetDate) return 0;
  const now = new Date();
  const target = new Date(targetDate);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffTime = targetStart.getTime() - todayStart.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getCountdownInfo = (targetDate) => {
  const days = calculateDaysRemaining(targetDate);
  if (days < 0) {
    return {
      days,
      text: 'Exam completed',
      variant: 'passed',
      color: '#64748b',
      bg: '#f1f5f9',
    };
  }
  if (days === 0) {
    return {
      days,
      text: 'Exam is Today!',
      variant: 'today',
      color: '#ef4444',
      bg: '#fee2e2',
    };
  }
  if (days === 1) {
    return {
      days,
      text: 'Tomorrow',
      variant: 'urgent',
      color: '#ea580c',
      bg: '#ffedd5',
    };
  }
  if (days <= 3) {
    return {
      days,
      text: `${days} days left`,
      variant: 'urgent',
      color: '#ea580c',
      bg: '#ffedd5',
    };
  }
  if (days <= 7) {
    return {
      days,
      text: `${days} days left`,
      variant: 'warning',
      color: '#b45309',
      bg: '#fef3c7',
    };
  }
  return {
    days,
    text: `${days} days left`,
    variant: 'normal',
    color: '#4f46e5',
    bg: '#e0e7ff',
  };
};

export const toInputDateFormat = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};
