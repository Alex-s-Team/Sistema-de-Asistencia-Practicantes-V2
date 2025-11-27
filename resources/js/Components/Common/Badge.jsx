import React from 'react';

export const Badge = ({ children, type = 'status', value, className = '' }) => {
  const getClass = () => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300';
    
    const statusClasses = {
      success: 'bg-[#2CA792]/20 text-[#2CA792] border border-[#2CA792]/30',
      error: 'bg-red-100 text-red-800 border border-red-200',
      warning: 'bg-[#F0C84F]/20 text-[#F0C84F] border border-[#F0C84F]/30',
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      info: 'bg-[#3484A5]/20 text-[#3484A5] border border-[#3484A5]/30',
    };

    const priorityClasses = {
      high: 'bg-red-100 text-red-800 border border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      low: 'bg-green-100 text-green-800 border border-green-200',
    };

    if (type === 'status') return `${baseClasses} ${statusClasses[value] || 'bg-gray-100 text-gray-800 border border-gray-200'}`;
    if (type === 'priority') return `${baseClasses} ${priorityClasses[value] || 'bg-gray-100 text-gray-800 border border-gray-200'}`;
    
    return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
  };

  return (
    <span className={`${getClass()} ${className}`}>
      {children}
    </span>
  );
};