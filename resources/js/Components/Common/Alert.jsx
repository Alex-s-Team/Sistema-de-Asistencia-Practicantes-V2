import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export const Alert = ({ 
  type = 'info', 
  message, 
  onClose, 
  className = '' 
}) => {
  const types = {
    success: {
      bg: 'bg-[#2CA792]/20',
      border: 'border-[#2CA792]/30',
      text: 'text-[#2CA792]',
      icon: CheckCircleIcon,
    },
    error: {
      bg: 'bg-red-100',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircleIcon,
    },
    warning: {
      bg: 'bg-[#F0C84F]/20',
      border: 'border-[#F0C84F]/30',
      text: 'text-[#F0C84F]',
      icon: ExclamationTriangleIcon,
    },
    info: {
      bg: 'bg-[#3484A5]/20',
      border: 'border-[#3484A5]/30',
      text: 'text-[#3484A5]',
      icon: InformationCircleIcon,
    },
  };

  const { bg, border, text, icon: Icon } = types[type];

  return (
    <div className={`${bg} ${border} border-2 rounded-2xl p-4 backdrop-blur-sm ${className}`}>
      <div className="flex items-center">
        <Icon className={`h-6 w-6 ${text} mr-3 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${text}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${text} hover:opacity-70 transition-opacity duration-300 p-1 rounded-lg hover:bg-white/50`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};