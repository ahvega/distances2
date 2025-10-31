'use client';

import React, { useState } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  className?: string;
}

const getTooltipClasses = (position: string) => {
  const baseClasses = 'absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg dark:bg-gray-700 whitespace-nowrap';

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return `${baseClasses} ${positionClasses[position as keyof typeof positionClasses]}`;
};

const getArrowClasses = (position: string) => {
  const baseClasses = 'absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45';

  const arrowPositions = {
    top: 'top-full left-1/2 transform -translate-x-1/2 -mt-1',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1',
    left: 'left-full top-1/2 transform -translate-y-1/2 -ml-1',
    right: 'right-full top-1/2 transform -translate-y-1/2 -mr-1',
  };

  return `${baseClasses} ${arrowPositions[position as keyof typeof arrowPositions]}`;
};

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({
    content,
    children,
    position = 'top',
    delay = 200,
    disabled = false,
    className
  }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const showTooltip = () => {
      if (disabled) return;

      const id = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      setTimeoutId(id);
    };

    const hideTooltip = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      setIsVisible(false);
    };

    return (
      <div
        ref={ref}
        className={`relative inline-block ${className || ''}`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}

        {isVisible && content && (
          <div className={getTooltipClasses(position)}>
            {content}
            <div className={getArrowClasses(position)} />
          </div>
        )}
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';