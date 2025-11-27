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
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 transition-all duration-300 hover:shadow-xl ${className}`} {...props}>
      {(title || actions) && (
        <div className="border-b border-gray-200/50 px-6 py-4 flex justify-between items-center mb-4">
          <div>
            {title && <h3 className="text-xl font-bold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-2">
        {children}
      </div>
    </div>
  );
};