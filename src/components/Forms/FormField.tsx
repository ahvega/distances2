'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({ label, icon, children, className }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {icon && <i className={`fas ${icon} mr-2 text-gray-500 dark:text-gray-400`}></i>}
        {label}
      </label>
      {children}
    </div>
  );
}
