// Unit Conversion Utilities
import { DistanceUnit, FuelEfficiencyUnit, DISTANCE_CONVERSION, FUEL_EFFICIENCY_CONVERSION } from '@/types/utils';

/**
 * Convert distance between kilometers and miles
 */
export function convertDistance(value: number, from: DistanceUnit, to: DistanceUnit): number {
  if (from === to) return value;

  if (from === 'km' && to === 'mile') {
    return value * DISTANCE_CONVERSION.KM_TO_MILES;
  }

  if (from === 'mile' && to === 'km') {
    return value * DISTANCE_CONVERSION.MILES_TO_KM;
  }

  return value;
}

/**
 * Convert fuel efficiency between different units
 */
export function convertFuelEfficiency(
  value: number,
  from: FuelEfficiencyUnit,
  to: FuelEfficiencyUnit
): number {
  if (from === to) return value;

  // Convert to a common base (km per liter) first, then to target
  let kmPerLiter: number;

  switch (from) {
    case 'kpl':
      kmPerLiter = value;
      break;
    case 'mpg':
      kmPerLiter = value * FUEL_EFFICIENCY_CONVERSION.MPG_TO_KPL;
      break;
    case 'mpl':
      // miles per liter to km per liter
      kmPerLiter = value * DISTANCE_CONVERSION.MILES_TO_KM;
      break;
    case 'kpg':
      // km per gallon to km per liter (1 gallon = 3.78541 liters)
      kmPerLiter = value / 3.78541;
      break;
    default:
      kmPerLiter = value;
  }

  // Convert from km per liter to target unit
  switch (to) {
    case 'kpl':
      return kmPerLiter;
    case 'mpg':
      return kmPerLiter * FUEL_EFFICIENCY_CONVERSION.KPL_TO_MPG;
    case 'mpl':
      return kmPerLiter * DISTANCE_CONVERSION.KM_TO_MILES;
    case 'kpg':
      return kmPerLiter * 3.78541;
    default:
      return kmPerLiter;
  }
}

/**
 * Get display label for distance unit
 */
export function getDistanceUnitLabel(unit: DistanceUnit): string {
  return unit === 'km' ? 'Kilometers' : 'Miles';
}

/**
 * Get display label for fuel efficiency unit
 */
export function getFuelEfficiencyUnitLabel(unit: FuelEfficiencyUnit): string {
  const labels = {
    'mpg': 'Miles per Gallon',
    'mpl': 'Miles per Liter',
    'kpl': 'Kilometers per Liter',
    'kpg': 'Kilometers per Gallon'
  };

  return labels[unit];
}