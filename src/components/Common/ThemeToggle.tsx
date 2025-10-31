'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'business';
  const title = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle"
      aria-label={title}
      title={title}
    >
      <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
    </button>
  );
}
