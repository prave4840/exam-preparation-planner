import React from 'react';
import { getCountdownInfo } from '../../utils/dateUtils.js';
import { Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

export const CountdownBadge = ({ examDate, size = 'md' }) => {
  const info = getCountdownInfo(examDate);

  const getIcon = () => {
    const iconSize = size === 'sm' ? 12 : 14;
    switch (info.variant) {
      case 'passed':
        return <CheckCircle size={iconSize} />;
      case 'today':
      case 'urgent':
        return <AlertTriangle size={iconSize} />;
      default:
        return <Clock size={iconSize} />;
    }
  };

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '4px' : '6px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        borderRadius: '9999px',
        fontSize: isSmall ? '11px' : '12px',
        fontWeight: 600,
        backgroundColor: info.bg,
        color: info.color,
        border: `1px solid ${info.color}25`,
        whiteSpace: 'nowrap',
      }}
    >
      {getIcon()}
      {info.text}
    </span>
  );
};

export default CountdownBadge;
