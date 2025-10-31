'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <label className="swap swap-rotate btn btn-ghost btn-circle">
      <input
        type="checkbox"
        className="theme-controller"
        checked={theme === 'business'}
        onChange={toggleTheme}
        aria-label={`Switch to ${theme === 'corporate' ? 'dark' : 'light'} mode`}
      />
      <i className="fas fa-sun swap-off text-lg"></i>
      <i className="fas fa-moon swap-on text-lg"></i>
    </label>
  );
}