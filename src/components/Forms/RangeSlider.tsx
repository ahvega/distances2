'use client';

import React from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
}

export default function RangeSlider({ min, max, step, value, onChange, unit }: RangeSliderProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-primary text-lg text-gray-900 dark:text-gray-100">{value}</span>
        {unit && <span className="text-sm opacity-70 text-gray-700 dark:text-gray-300">{unit}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        className="range range-primary w-full"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        aria-label={`Range from ${min} to ${max}`}
      />
      <div className="w-full flex justify-between text-xs px-1 text-gray-700 dark:text-gray-300">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
