// Local Storage Utilities
import { SystemParameters, Vehicle } from '@/types';
import { DEFAULT_SYSTEM_PARAMETERS } from '@/types/utils';

const STORAGE_KEYS = {
  SYSTEM_PARAMETERS: 'transportation_system_parameters',
  VEHICLES: 'transportation_vehicles',
  PARAMETER_HISTORY: 'transportation_parameter_history'
} as const;

/**
 * Get system parameters from localStorage
 */
export function getStoredParameters(): SystemParameters {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SYSTEM_PARAMETERS);
    if (stored) {
      return { ...DEFAULT_SYSTEM_PARAMETERS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error reading parameters from storage:', error);
  }

  return DEFAULT_SYSTEM_PARAMETERS;
}

/**
 * Save system parameters to localStorage
 */
export function saveParameters(parameters: SystemParameters): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_PARAMETERS, JSON.stringify(parameters));

    // Save to parameter history
    const history = getParameterHistory();
    history.push({
      parameters,
      timestamp: new Date().toISOString()
    });

    // Keep only last 50 entries
    const trimmedHistory = history.slice(-50);
    localStorage.setItem(STORAGE_KEYS.PARAMETER_HISTORY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving parameters to storage:', error);
  }
}

/**
 * Get vehicles from localStorage
 */
export function getStoredVehicles(): Vehicle[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading vehicles from storage:', error);
  }

  return [];
}

/**
 * Save vehicles to localStorage
 */
export function saveVehicles(vehicles: Vehicle[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  } catch (error) {
    console.error('Error saving vehicles to storage:', error);
  }
}

/**
 * Get parameter change history
 */
export function getParameterHistory(): Array<{ parameters: SystemParameters; timestamp: string }> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PARAMETER_HISTORY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading parameter history from storage:', error);
  }

  return [];
}

/**
 * Clear all stored data (for testing/reset purposes)
 */
export function clearStoredData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing stored data:', error);
  }
}