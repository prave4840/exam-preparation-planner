import React from 'react';

export const SkeletonCard = ({ height = '140px', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="skeleton"
          style={{
            height,
            width: '100%',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '16px',
          }}
        />
      ))}
    </>
  );
};

export default SkeletonCard;
