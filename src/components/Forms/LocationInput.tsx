'use client';

import React, { useRef, useState } from 'react';
import type { PlaceResult } from '@/hooks/useGooglePlaces';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  onPlaceSelect?: (place: PlaceResult) => void;
  placeholder: string;
  icon: string;
  enableAutocomplete?: boolean;
  showValidation?: boolean;
}

const LocationInput = React.memo<LocationInputProps>(function LocationInput({
  value,
  onChange,
  onBlur,
  onPlaceSelect,
  placeholder,
  icon,
}: LocationInputProps) {
  const [localValue, setLocalValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
      onBlur?.(localValue);
    }
  };

  return (
    <div className="relative">
      <i className={`fas ${icon} absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10`}></i>
      <input
        ref={inputRef}
        type="text"
        className="w-full rounded-lg border pl-10 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-600"
        value={localValue || ''}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
});

export default LocationInput;
