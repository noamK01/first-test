import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 border-slate-100">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
