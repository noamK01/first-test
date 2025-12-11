import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`glass-card rounded-2xl p-6 transition-all duration-300 ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-center mb-5 border-b border-slate-100/50 pb-3">
          {title && <h3 className="text-lg font-bold text-slate-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};