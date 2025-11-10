import React from 'react';

export const Card = ({ 
  children, 
  title, 
  subtitle,
  actions,
  className = '',
  ...props 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`} {...props}>
      {(title || actions) && (
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
