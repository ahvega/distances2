'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGooglePlaces, useAutocompleteInput, PlaceResult } from '@/hooks/useGooglePlaces';
import { validateLocationInput, formatLocationForPlaces } from '@/utils/placesValidation';
import { useDebounce, useDebounceCallback } from '@/utils/debounce';

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
  enableAutocomplete = true,
  showValidation = true
}: LocationInputProps) {
  const [localValue, setLocalValue] = useState(value || '');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { searchPlaces, validateLocation, isLoaded } = useGooglePlaces({
    types: ['geocode'],
    componentRestrictions: { country: 'hn' },
  });

  // Memoized place selection handler to prevent infinite re-renders
  const handlePlaceSelect = useCallback((place: PlaceResult) => {
    setLocalValue(place.formattedAddress);
    onChange(place.formattedAddress);
    onPlaceSelect?.(place);
    setIsValid(true);
    setShowSuggestions(false);
  }, [onChange, onPlaceSelect]);

  // Auto-complete integration for direct place selection
  const { autocomplete } = useAutocompleteInput(
    inputRef as React.RefObject<HTMLInputElement>,
    handlePlaceSelect,
    {
      types: ['geocode'],
      componentRestrictions: { country: 'hn' },
    }
  );

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value || '');
    if (value && showValidation) {
      validateLocationAsync(value);
    }
  }, [value]);

  // Debounced value for API calls
  const debouncedValue = useDebounce(localValue, 300);

  // Debounced search function
  const debouncedSearch = useDebounceCallback(
    useCallback(async (searchValue: string) => {
      if (!enableAutocomplete || !isLoaded || !searchValue.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const results = await searchPlaces(searchValue);
        setSuggestions(results.slice(0, 5)); // Limit to 5 suggestions
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('Error searching places:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, [enableAutocomplete, isLoaded, searchPlaces]),
    300,
    [enableAutocomplete, isLoaded, searchPlaces]
  );

  // Trigger search when debounced value changes
  useEffect(() => {
    debouncedSearch(debouncedValue);
  }, [debouncedValue, debouncedSearch]);

  const validateLocationAsync = async (location: string) => {
    if (!showValidation || !isLoaded) return;

    setIsValidating(true);
    try {
      const valid = await validateLocation(location);
      setIsValid(valid);
    } catch (error) {
      console.error('Error validating location:', error);
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const formattedValue = formatLocationForPlaces(newValue);
    setLocalValue(formattedValue);
    setIsValid(null);
    setSelectedIndex(-1);

    // Basic client-side validation
    const validation = validateLocationInput(formattedValue);
    if (!validation.isValid && formattedValue.trim()) {
      setIsValid(false);
    }
  };

  const handleBlur = () => {
    // Delay to allow suggestion click to register
    setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
        onBlur?.(localValue);

        if (showValidation && localValue.trim()) {
          validateLocationAsync(localValue);
        }
      }
      setShowSuggestions(false);
    }, 150);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleBlur();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          handleBlur();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectSuggestion = (suggestion: PlaceResult) => {
    setLocalValue(suggestion.formattedAddress);
    onChange(suggestion.formattedAddress);
    onPlaceSelect?.(suggestion);
    setIsValid(true);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const getInputClassName = () => {
    let baseClass = "input input-bordered w-full pl-10";

    if (showValidation && isValid !== null) {
      if (isValid) {
        baseClass += " border-green-500 focus:border-green-500";
      } else {
        baseClass += " border-red-500 focus:border-red-500";
      }
    }

    return baseClass;
  };

  const getValidationIcon = () => {
    if (!showValidation) return null;

    if (isValidating) {
      return (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="loading loading-spinner loading-sm text-gray-400"></div>
        </div>
      );
    }

    if (isValid === true) {
      return (
        <i className="fas fa-check-circle absolute right-3 top-1/2 -translate-y-1/2 text-green-500"></i>
      );
    }

    if (isValid === false) {
      return (
        <i className="fas fa-exclamation-circle absolute right-3 top-1/2 -translate-y-1/2 text-red-500"></i>
      );
    }

    return null;
  };

  return (
    <div className="relative">
      <i className={`fas ${icon} absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10`}></i>
      <input
        ref={inputRef}
        type="text"
        className={getInputClassName()}
        value={localValue || ''}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      {getValidationIcon()}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.placeId}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => selectSuggestion(suggestion)}
            >
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt text-gray-400 mr-3"></i>
                <div>
                  <div className="font-medium text-gray-900">
                    {suggestion.description}
                  </div>
                  {suggestion.formattedAddress !== suggestion.description && (
                    <div className="text-sm text-gray-500">
                      {suggestion.formattedAddress}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Validation error message */}
      {showValidation && isValid === false && localValue.trim() && (
        <div className="text-red-500 text-sm mt-1">
          <i className="fas fa-exclamation-triangle mr-1"></i>
          Ubicación no encontrada. Por favor, verifica la dirección.
        </div>
      )}
    </div>
  );
});

export default LocationInput;
