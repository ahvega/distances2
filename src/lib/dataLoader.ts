import { Vehicle, Parameter, ExchangeRates } from '@/types';

const API_BASE_URL = 'http://demo.quotingtours.com/api/v1';

/**
 * Check if a remote API is available by testing the favicon
 */
async function isApiOnline(url: string): Promise<boolean> {
  try {
    const response = await fetch(`${url}/favicon.ico`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Load vehicles data with fallback to local JSON
 */
export async function loadVehicles(): Promise<Vehicle[]> {
  try {
    // Try remote API first
    if (await isApiOnline(API_BASE_URL)) {
      const response = await fetch(`${API_BASE_URL}/tipodevehiculo/`);
      if (response.ok) {
        return await response.json();
      }
    }
  } catch (error) {
    console.warn('Failed to fetch vehicles from API, falling back to local data:', error);
  }

  // Fallback to local JSON
  try {
    const response = await fetch('/data/tipodevehiculo.json');
    return await response.json();
  } catch (error) {
    console.error('Failed to load vehicles data:', error);
    return [];
  }
}

/**
 * Load parameters data with fallback to local JSON
 */
export async function loadParameters(): Promise<Parameter[]> {
  try {
    // Try remote API first
    if (await isApiOnline(API_BASE_URL)) {
      const response = await fetch(`${API_BASE_URL}/parametro/`);
      if (response.ok) {
        return await response.json();
      }
    }
  } catch (error) {
    console.warn('Failed to fetch parameters from API, falling back to local data:', error);
  }

  // Fallback to local JSON
  try {
    const response = await fetch('/data/parametro.json');
    return await response.json();
  } catch (error) {
    console.error('Failed to load parameters data:', error);
    return [];
  }
}

/**
 * Load exchange rates from local JSON
 */
export async function loadExchangeRates(): Promise<ExchangeRates | null> {
  try {
    const response = await fetch('/data/tasaUSD.json');
    return await response.json();
  } catch (error) {
    console.error('Failed to load exchange rates:', error);
    return null;
  }
}

/**
 * Load additional data from myData.json
 */
export async function loadMyData(): Promise<Parameter[]> {
  try {
    const response = await fetch('/data/myData.json');
    return await response.json();
  } catch (error) {
    console.error('Failed to load additional data:', error);
    return [];
  }
}

/**
 * Process parameters into a more usable format
 */
export function processParameters(parameters: Parameter[]): Record<string, Parameter> {
  const processed: Record<string, Parameter> = {};

  // Get the latest year parameters
  const latestYear = Math.max(...parameters.map(p => p.annio));
  const latestParams = parameters.filter(p => p.annio === latestYear);

  latestParams.forEach(param => {
    const slug = param.slug.substr(5).replace(/-/g, '_');
    processed[slug] = param;
  });

  return processed;
}

/**
 * Process vehicles into a more usable format
 */
export function processVehicles(vehicles: Vehicle[]): Record<string, Vehicle> {
  const processed: Record<string, Vehicle> = {};

  vehicles.forEach(vehicle => {
    processed[vehicle.id] = vehicle;
  });

  return processed;
}