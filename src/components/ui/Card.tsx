'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const getCardClasses = (variant: string, padding: string, hover: boolean, className?: string) => {
  const baseClasses = 'rounded-xl transition-all duration-200';

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800',
    outlined: 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700',
    elevated: 'bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900/20',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover
    ? 'hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-700 cursor-pointer'
    : '';

  return `${baseClasses} ${variantClasses[variant as keyof typeof variantClasses]} ${paddingClasses[padding as keyof typeof paddingClasses]} ${hoverClasses} ${className || ''}`.trim();
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'outlined',
    padding = 'md',
    hover = false,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={getCardClasses(variant, padding, hover, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for better composition
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`border-b border-gray-200 pb-4 mb-4 dark:border-gray-700 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className || ''}`}
      {...props}
    >
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-gray-600 dark:text-gray-400 ${className || ''}`}
      {...props}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`border-t border-gray-200 pt-4 mt-4 dark:border-gray-700 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';