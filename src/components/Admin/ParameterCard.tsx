'use client';

import React from 'react';
import type { SystemParameters } from '@/types';

interface ParameterCardProps {
  title: string;
  icon: string;
  value: string | number;
  unit?: string;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  lastUpdated?: Date;
  onClick?: () => void;
}

export default function ParameterCard({
  title,
  icon,
  value,
  unit,
  description,
  trend,
  lastUpdated,
  onClick
}: ParameterCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'fa-arrow-up text-success';
      case 'down':
        return 'fa-arrow-down text-error';
      case 'stable':
        return 'fa-minus text-warning';
      default:
        return '';
    }
  };

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    return val;
  };

  return (
    <div
      className={`card bg-base-100 shadow-lg hover:shadow-xl transition-shadow ${
        onClick ? 'cursor-pointer hover:bg-base-200' : ''
      }`}
      onClick={onClick}
    >
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-12 h-12">
                <i className={`fas ${icon} text-lg`}></i>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-base">{title}</h3>
              {description && (
                <p className="text-sm text-base-content/60">{description}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className="flex items-center">
              <i className={`fas ${getTrendIcon()} text-sm`}></i>
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{formatValue(value)}</span>
            {unit && <span className="text-sm text-base-content/60">{unit}</span>}
          </div>

          {lastUpdated && (
            <div className="text-xs text-base-content/50 mt-1">
              Updated {lastUpdated.toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ParameterOverviewProps {
  parameters: SystemParameters;
  onParameterClick?: (parameterKey: string) => void;
}

export function ParameterOverview({ parameters, onParameterClick }: ParameterOverviewProps) {
  const parameterCards = [
    {
      key: 'fuelPrice',
      title: 'Fuel Price',
      icon: 'fa-gas-pump',
      value: parameters.fuelPrice,
      unit: 'HNL/gal',
      description: 'Current diesel fuel price'
    },
    {
      key: 'mealCostPerDay',
      title: 'Daily Meals',
      icon: 'fa-utensils',
      value: parameters.mealCostPerDay,
      unit: 'HNL/day',
      description: 'Cost for 3 meals per day'
    },
    {
      key: 'hotelCostPerNight',
      title: 'Hotel Cost',
      icon: 'fa-bed',
      value: parameters.hotelCostPerNight,
      unit: 'HNL/night',
      description: 'Lodging cost per night'
    },
    {
      key: 'exchangeRate',
      title: 'Exchange Rate',
      icon: 'fa-exchange-alt',
      value: parameters.exchangeRate,
      unit: 'HNL/USD',
      description: parameters.useCustomExchangeRate ? 'Custom rate' : 'System rate'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {parameterCards.map((card) => (
        <ParameterCard
          key={card.key}
          title={card.title}
          icon={card.icon}
          value={card.value}
          unit={card.unit}
          description={card.description}
          onClick={() => onParameterClick?.(card.key)}
        />
      ))}
    </div>
  );
}