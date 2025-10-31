/**
 * Utility functions for validating Google Places API integration
 */

export interface LocationValidationResult {
  isValid: boolean;
  message: string;
  suggestions?: string[];
}

/**
 * Validates if a location string is suitable for Google Places API
 */
export function validateLocationInput(location: string): LocationValidationResult {
  if (!location || location.trim().length === 0) {
    return {
      isValid: false,
      message: 'La ubicación no puede estar vacía'
    };
  }

  if (location.trim().length < 3) {
    return {
      isValid: false,
      message: 'La ubicación debe tener al menos 3 caracteres'
    };
  }

  if (location.length > 200) {
    return {
      isValid: false,
      message: 'La ubicación es demasiado larga'
    };
  }

  // Check for potentially problematic characters
  const problematicChars = /[<>{}[\]\\]/;
  if (problematicChars.test(location)) {
    return {
      isValid: false,
      message: 'La ubicación contiene caracteres no válidos'
    };
  }

  return {
    isValid: true,
    message: 'Ubicación válida'
  };
}

/**
 * Formats a location string for better Google Places API results
 */
export function formatLocationForPlaces(location: string): string {
  return location
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[,]{2,}/g, ',') // Replace multiple commas with single comma
    .replace(/^,|,$/, ''); // Remove leading/trailing commas
}

/**
 * Checks if Google Places API is available
 */
export function isGooglePlacesAvailable(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    window.google &&
    window.google.maps &&
    window.google.maps.places &&
    window.google.maps.places.AutocompleteService &&
    window.google.maps.places.PlacesService
  );
}

/**
 * Gets error message for Google Places API status
 */
export function getPlacesErrorMessage(status: string): string {
  const errorMessages: Record<string, string> = {
    'ZERO_RESULTS': 'No se encontraron resultados para esta ubicación',
    'OVER_QUERY_LIMIT': 'Se ha excedido el límite de consultas. Intenta más tarde',
    'REQUEST_DENIED': 'Acceso denegado a la API de Google Places',
    'INVALID_REQUEST': 'Solicitud inválida. Verifica los parámetros',
    'UNKNOWN_ERROR': 'Error desconocido. Intenta nuevamente',
    'NOT_FOUND': 'Ubicación no encontrada',
    'ERROR': 'Error en el servicio de ubicaciones'
  };

  return errorMessages[status] || 'Error desconocido en el servicio de ubicaciones';
}