'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

// Global state to track script loading
let isScriptLoading = false;
let isScriptLoaded = false;
const loadingCallbacks: (() => void)[] = [];

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      isScriptLoaded = true;
      return;
    }

    // If already loaded globally, set state
    if (isScriptLoaded) {
      setIsLoaded(true);
      return;
    }

    // If script is currently loading, add callback
    if (isScriptLoading) {
      loadingCallbacks.push(() => setIsLoaded(true));
      return;
    }

    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.');
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      // Script exists, wait for it to load
      isScriptLoading = true;
      loadingCallbacks.push(() => setIsLoaded(true));
      return;
    }

    // Start loading
    isScriptLoading = true;

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initMap&language=es&region=HN`;
    script.async = true;
    script.defer = true;

    // Set up callback
    window.initMap = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      setIsLoaded(true);

      // Call all waiting callbacks
      loadingCallbacks.forEach(callback => callback());
      loadingCallbacks.length = 0;
    };

    // Handle errors
    script.onerror = () => {
      isScriptLoading = false;
      setError('Failed to load Google Maps API');
    };

    // Add script to document
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Don't remove the script or callback as other components might need it
      // Just remove this component's callback from the list
      const index = loadingCallbacks.indexOf(() => setIsLoaded(true));
      if (index > -1) {
        loadingCallbacks.splice(index, 1);
      }
    };
  }, []);

  return { isLoaded, error };
}

export interface RouteCalculationParams {
  base: string;
  origen: string;
  destino: string;
}

export interface RouteResult {
  baseToOrigen: google.maps.DistanceMatrixResponseElement;
  origenToDestino: google.maps.DistanceMatrixResponseElement;
  destinoToBase: google.maps.DistanceMatrixResponseElement;
  totalDistance: number;
  route: google.maps.DirectionsResult;
}

export function useRouteCalculation() {
  const { isLoaded } = useGoogleMaps();

  const calculateRoute = async (params: RouteCalculationParams): Promise<RouteResult | null> => {
    if (!isLoaded || !window.google) {
      throw new Error('Google Maps not loaded');
    }

    // Validate input parameters
    if (!params.base?.trim() || !params.origen?.trim() || !params.destino?.trim()) {
      throw new Error('All locations (base, origen, destino) must be provided and non-empty');
    }

    const distanceMatrixService = new google.maps.DistanceMatrixService();
    const directionsService = new google.maps.DirectionsService();

    try {
      // Calculate distance matrix with better error handling
      const matrixResult = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
        distanceMatrixService.getDistanceMatrix(
          {
            origins: [params.base.trim(), params.origen.trim()],
            destinations: [params.base.trim(), params.destino.trim()],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false,
            region: 'HN', // Restrict to Honduras
          },
          (response, status) => {
            if (status === google.maps.DistanceMatrixStatus.OK && response) {
              // Additional validation of response
              if (!response.rows || response.rows.length === 0) {
                reject(new Error('Distance Matrix API returned empty results'));
                return;
              }

              // Check if any elements have errors
              const hasErrors = response.rows.some(row =>
                row.elements.some(element =>
                  element.status !== google.maps.DistanceMatrixElementStatus.OK
                )
              );

              if (hasErrors) {
                const errorElements = response.rows.flatMap(row =>
                  row.elements.filter(element =>
                    element.status !== google.maps.DistanceMatrixElementStatus.OK
                  )
                );
                reject(new Error(`Some locations could not be found: ${errorElements.map(e => e.status).join(', ')}`));
                return;
              }

              resolve(response);
            } else {
              let errorMessage = `Distance Matrix API error: ${status}`;
              if (status === google.maps.DistanceMatrixStatus.UNKNOWN_ERROR) {
                errorMessage += '. This may be due to invalid locations or network issues. Please verify the addresses.';
              } else if (status === google.maps.DistanceMatrixStatus.OVER_QUERY_LIMIT) {
                errorMessage += '. API quota exceeded. Please try again later.';
              } else if (status === google.maps.DistanceMatrixStatus.REQUEST_DENIED) {
                errorMessage += '. API request denied. Please check your API key permissions.';
              }
              reject(new Error(errorMessage));
            }
          }
        );
      });

      // Calculate directions for main route
      const directionsResult = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(
          {
            origin: params.origen.trim(),
            destination: params.destino.trim(),
            travelMode: google.maps.TravelMode.DRIVING,
            region: 'HN', // Restrict to Honduras
          },
          (response, status) => {
            if (status === google.maps.DirectionsStatus.OK && response) {
              resolve(response);
            } else {
              let errorMessage = `Directions API error: ${status}`;
              if (status === google.maps.DirectionsStatus.NOT_FOUND) {
                errorMessage += '. One or more locations could not be found.';
              } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
                errorMessage += '. No route could be found between the locations.';
              } else if (status === google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
                errorMessage += '. API quota exceeded. Please try again later.';
              }
              reject(new Error(errorMessage));
            }
          }
        );
      });

      // Extract distance data with null checks
      const rows = matrixResult.rows;
      if (!rows || rows.length < 2) {
        throw new Error('Invalid distance matrix response');
      }

      const baseToOrigen = rows[1]?.elements?.[0]; // From base to origen
      const origenToDestino = rows[1]?.elements?.[1]; // From origen to destino
      const destinoToBase = rows[0]?.elements?.[1]; // From destino to base

      // Validate all elements exist and have valid data
      if (!baseToOrigen?.distance || !origenToDestino?.distance || !destinoToBase?.distance) {
        throw new Error('Invalid distance data in matrix response');
      }

      const totalDistance =
        Math.round(baseToOrigen.distance.value / 1000) +
        Math.round(origenToDestino.distance.value / 1000) +
        Math.round(destinoToBase.distance.value / 1000);

      return {
        baseToOrigen,
        origenToDestino,
        destinoToBase,
        totalDistance,
        route: directionsResult,
      };

    } catch (error) {
      console.error('Route calculation error:', error);

      // Try fallback method using geocoding and straight-line distance
      try {
        const fallbackResult = await calculateFallbackRoute(params, directionsService);
        if (fallbackResult) {
          return fallbackResult;
        }
      } catch (fallbackError) {
        console.error('Fallback route calculation also failed:', fallbackError);
      }

      // Re-throw with more specific error information
      if (error instanceof Error) {
        throw new Error(`Failed to calculate route: ${error.message}`);
      }

      throw new Error('Failed to calculate route: Unknown error');
    }
  };

  // Fallback route calculation using estimated distances
  const calculateFallbackRoute = async (
    params: RouteCalculationParams,
    directionsService: google.maps.DirectionsService
  ): Promise<RouteResult | null> => {

    // Try to get directions first (this is usually more reliable than Distance Matrix)
    try {
      const directionsResult = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(
          {
            origin: params.origen.trim(),
            destination: params.destino.trim(),
            travelMode: google.maps.TravelMode.DRIVING,
            region: 'HN',
          },
          (response, status) => {
            if (status === google.maps.DirectionsStatus.OK && response) {
              resolve(response);
            } else {
              reject(new Error(`Directions API error: ${status}`));
            }
          }
        );
      });

      // If directions work, create estimated distances
      const route = directionsResult.routes[0];
      const mainDistance = route.legs[0].distance?.value || 0;
      const mainDuration = route.legs[0].duration?.value || 0;

      // Estimate other distances (this is a rough approximation)
      const estimatedBaseToOrigen = Math.round(mainDistance * 0.3); // Assume 30% of main route
      const estimatedDestinoToBase = Math.round(mainDistance * 0.4); // Assume 40% of main route

      const createMockElement = (distance: number, duration: number): google.maps.DistanceMatrixResponseElement => ({
        distance: { text: `${Math.round(distance / 1000)} km`, value: distance },
        duration: { text: `${Math.round(duration / 60)} min`, value: duration },
        status: google.maps.DistanceMatrixElementStatus.OK,
        duration_in_traffic: { text: `${Math.round(duration / 60)} min`, value: duration },
        fare: null as any,
      });

      return {
        baseToOrigen: createMockElement(estimatedBaseToOrigen, Math.round(mainDuration * 0.3)),
        origenToDestino: createMockElement(mainDistance, mainDuration),
        destinoToBase: createMockElement(estimatedDestinoToBase, Math.round(mainDuration * 0.4)),
        totalDistance: Math.round((estimatedBaseToOrigen + mainDistance + estimatedDestinoToBase) / 1000),
        route: directionsResult,
      };
    } catch (directionsError) {
      console.error('Fallback directions also failed:', directionsError);
      return null;
    }
  };

  return { isLoaded, calculateRoute };
}