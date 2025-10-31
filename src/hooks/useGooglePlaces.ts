'use client';

import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from './useGoogleMaps';
import { placesCache, createCacheKey } from '@/utils/cache';

export interface PlaceResult {
  placeId: string;
  description: string;
  formattedAddress: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface PlacesAutocompleteOptions {
  types?: string[];
  componentRestrictions?: google.maps.places.ComponentRestrictions;
  fields?: string[];
}

export function useGooglePlaces(options?: PlacesAutocompleteOptions) {
  const { isLoaded } = useGoogleMaps();
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (isLoaded && window.google?.maps?.places) {
      setAutocompleteService(new google.maps.places.AutocompleteService());

      // Create a dummy div for PlacesService (required by Google Maps API)
      const dummyDiv = document.createElement('div');
      const map = new google.maps.Map(dummyDiv);
      setPlacesService(new google.maps.places.PlacesService(map));
    }
  }, [isLoaded]);

  const searchPlaces = async (input: string): Promise<PlaceResult[]> => {
    if (!autocompleteService || !input.trim()) {
      return [];
    }

    // Create cache key for this search
    const cacheKey = createCacheKey('places-search', {
      input: input.trim().toLowerCase(),
      types: options?.types || ['geocode'],
      country: options?.componentRestrictions?.country || 'hn'
    });

    // Check cache first
    const cached = placesCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const defaultRestrictions: google.maps.places.ComponentRestrictions = { country: 'hn' };
      const request: google.maps.places.AutocompletionRequest = {
        input: input.trim(),
        types: options?.types || ['geocode'],
        componentRestrictions: options?.componentRestrictions || defaultRestrictions,
      };

      const response = await new Promise<google.maps.places.AutocompleteResponse>((resolve, reject) => {
        autocompleteService.getPlacePredictions(request, (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve({ predictions });
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve({ predictions: [] });
          } else {
            reject(new Error(`Places Autocomplete error: ${status}`));
          }
        });
      });

      const results = response.predictions.map(prediction => ({
        placeId: prediction.place_id,
        description: prediction.description,
        formattedAddress: prediction.structured_formatting?.main_text || prediction.description,
        geometry: undefined, // Will be populated by getPlaceDetails if needed
      }));

      // Cache the results
      placesCache.set(cacheKey, results);

      return results;
    } catch (error) {
      console.error('Places search error:', error);
      return [];
    }
  };

  const getPlaceDetails = async (placeId: string): Promise<PlaceResult | null> => {
    if (!placesService) {
      return null;
    }

    // Create cache key for place details
    const cacheKey = createCacheKey('place-details', {
      placeId,
      fields: options?.fields || ['place_id', 'formatted_address', 'geometry', 'name']
    });

    // Check cache first
    const cached = placesCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: options?.fields || ['place_id', 'formatted_address', 'geometry', 'name'],
      };

      const response = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        placesService.getDetails(request, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place);
          } else {
            reject(new Error(`Place Details error: ${status}`));
          }
        });
      });

      const result = {
        placeId: response.place_id || placeId,
        description: response.name || response.formatted_address || '',
        formattedAddress: response.formatted_address || '',
        geometry: response.geometry?.location ? {
          location: {
            lat: response.geometry.location.lat(),
            lng: response.geometry.location.lng(),
          }
        } : undefined,
      };

      // Cache the result
      placesCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Place details error:', error);
      return null;
    }
  };

  const validateLocation = async (address: string): Promise<boolean> => {
    if (!address.trim()) {
      return false;
    }

    try {
      const predictions = await searchPlaces(address);
      return predictions.length > 0;
    } catch (error) {
      console.error('Location validation error:', error);
      return false;
    }
  };

  return {
    isLoaded: isLoaded && !!autocompleteService && !!placesService,
    searchPlaces,
    getPlaceDetails,
    validateLocation,
  };
}

export function useAutocompleteInput(
  inputRef: React.RefObject<HTMLInputElement>,
  onPlaceSelect: (place: PlaceResult) => void,
  options?: PlacesAutocompleteOptions
) {
  const { isLoaded } = useGoogleMaps();
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const optionsRef = useRef(options);
  const isInitializedRef = useRef(false);

  // Update refs when values change
  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
    optionsRef.current = options;
  });

  useEffect(() => {
    if (isLoaded && inputRef.current && window.google?.maps?.places && !isInitializedRef.current) {
      const currentOptions = optionsRef.current;
      const defaultRestrictions: google.maps.places.ComponentRestrictions = { country: 'hn' };

      try {
        const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
          types: currentOptions?.types || ['geocode'],
          componentRestrictions: currentOptions?.componentRestrictions || defaultRestrictions,
          fields: currentOptions?.fields || ['place_id', 'formatted_address', 'geometry', 'name'],
        });

        const listener = autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();

          if (place.place_id) {
            const placeResult: PlaceResult = {
              placeId: place.place_id,
              description: place.name || place.formatted_address || '',
              formattedAddress: place.formatted_address || '',
              geometry: place.geometry?.location ? {
                location: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                }
              } : undefined,
            };

            onPlaceSelectRef.current(placeResult);
          }
        });

        setAutocomplete(autocompleteInstance);
        isInitializedRef.current = true;

        return () => {
          if (listener) {
            google.maps.event.removeListener(listener);
          }
          isInitializedRef.current = false;
        };
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error);
      }
    }
  }, [isLoaded]);

  return { autocomplete, isLoaded };
}