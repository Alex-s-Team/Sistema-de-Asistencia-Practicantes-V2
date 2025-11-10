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
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircleIcon,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircleIcon,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: ExclamationTriangleIcon,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: InformationCircleIcon,
    },
  };

  const { bg, border, text, icon: Icon } = types[type];

  return (
    <div className={`${bg} ${border} border rounded-lg p-4 ${className}`}>
      <div className="flex">
        <Icon className={`h-5 w-5 ${text} mr-3 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`text-sm ${text}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${text} hover:opacity-70 transition-opacity`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};
