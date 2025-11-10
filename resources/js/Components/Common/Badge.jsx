import React from 'react';
import { getStatusBadgeClass, getPriorityBadgeClass } from '../../Utils/helpers';

export const Badge = ({ children, type = 'status', value, className = '' }) => {
  const getClass = () => {
    if (type === 'status') return getStatusBadgeClass(value);
    if (type === 'priority') return getPriorityBadgeClass(value);
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getClass()} ${className}`}>
      {children}
    </span>
  );
};
