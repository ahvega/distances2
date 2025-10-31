// Formatting Utilities
import { CurrencyType } from '@/types/utils';

/**
 * Format currency value with proper symbol and decimals
 */
export function formatCurrency(amount: number, currency: CurrencyType = 'HNL'): string {
  const symbols = {
    'USD': '$',
    'HNL': 'L.'
  };

  return `${symbols[currency]}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Format distance with appropriate unit
 */
export function formatDistance(distance: number, unit: 'km' | 'mile' = 'km'): string {
  const unitLabel = unit === 'km' ? 'km' : 'mi';
  return `${distance.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })} ${unitLabel}`;
}

/**
 * Format duration in hours and minutes
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) {
    return `${mins} min`;
  }

  if (mins === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${mins} min`;
}

/**
 * Format percentage with % symbol
 */
export function formatPercentage(value: number): string {
  return `${value}%`;
}

/**
 * Format fuel efficiency with unit
 */
export function formatFuelEfficiency(value: number, unit: string): string {
  return `${value.toFixed(1)} ${unit}`;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}