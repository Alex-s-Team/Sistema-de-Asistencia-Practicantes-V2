import React from 'react';

export const LoadingSpinner = ({ size = 'md', message }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <svg
          className={`animate-spin text-[#3484A5] ${sizes[size]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-gradient-to-r from-[#3484A5] to-[#2CA792] rounded-full animate-pulse"></div>
        </div>
      </div>
      {message && (
        <p className="mt-4 text-gray-600 text-sm font-medium bg-white/50 backdrop-blur-sm rounded-full px-4 py-2">
          {message}
        </p>
      )}
    </div>
  );
};