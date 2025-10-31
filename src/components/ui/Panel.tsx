'use client';

import React from 'react';

type PanelProps = {
  title?: string;
  subtitle?: string;
  icon?: string; // Font Awesome icon class, e.g., 'fas fa-edit'
  headerGradient?: string; // e.g., 'from-blue-500 to-cyan-500'
  className?: string;
  children: React.ReactNode;
};

export default function Panel({
  title,
  subtitle,
  icon,
  headerGradient = 'from-blue-500 to-cyan-500',
  className = '',
  children,
}: PanelProps) {
  return (
    <section
      className={`bg-white dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_24px_60px_-28px_rgba(0,0,0,0.45),0_16px_32px_-24px_rgba(0,0,0,0.3)] ${className}`}
    >
      {(title || subtitle || icon) && (
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 dark:border-slate-700/60 rounded-t-xl">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-r ${headerGradient} text-white shadow-md`}>
                <i className={`${icon} text-sm`} aria-hidden="true"></i>
              </div>
            )}
            <div>
              {title && (
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}
