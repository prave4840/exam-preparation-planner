/**
 * Date calculation and validation helpers
 */

export const calculateDaysRemaining = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  
  // Set both to start of day for accurate full calendar days count
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffTime = targetStart.getTime() - todayStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isPastDate = (date) => {
  const target = new Date(date);
  const now = new Date();
  // Compare by start of day so setting today's date for an exam is valid, but yesterday is past
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return targetStart < todayStart;
};

export const isAfterDate = (dateA, dateB) => {
  const a = new Date(dateA);
  const b = new Date(dateB);
  // Compare start of day
  const aStart = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bStart = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return aStart > bStart;
};
