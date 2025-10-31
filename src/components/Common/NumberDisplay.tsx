'use client';

import React from 'react';

interface NumberDisplayProps {
  value: number;
  currency?: string;
  decimals?: number;
  className?: string;
}

export default function NumberDisplay({
  value,
  currency,
  decimals = 0,
  className = ''
}: NumberDisplayProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-HN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  return (
    <div className={`flex items-baseline gap-1 ${className}`}>
      {currency && (
        <span className="text-xs font-medium opacity-70 mono-font">{currency}</span>
      )}
      <span className="mono-font font-semibold text-base-content">
        {formatNumber(value)}
      </span>
    </div>
  );
}