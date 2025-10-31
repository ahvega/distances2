// Utility Types and Constants

// Unit Conversion Types
export type DistanceUnit = 'km' | 'mile';
export type FuelEfficiencyUnit = 'mpg' | 'mpl' | 'kpl' | 'kpg';
export type CurrencyType = 'USD' | 'HNL';

// Markup Options
export const MARKUP_OPTIONS = [10, 15, 20, 25, 30] as const;
export const RECOMMENDED_MARKUP = 15;

// Unit Conversion Constants
export const DISTANCE_CONVERSION = {
  KM_TO_MILES: 0.621371,
  MILES_TO_KM: 1.60934
} as const;

export const FUEL_EFFICIENCY_CONVERSION = {
  MPG_TO_KPL: 0.425144,
  KPL_TO_MPG: 2.35215,
  MPL_TO_KPG: 1,
  KPG_TO_MPL: 1
} as const;

// Default Values
export const DEFAULT_SYSTEM_PARAMETERS: SystemParameters = {
  fuelPrice: 25.50, // HNL per gallon
  mealCostPerDay: 300, // HNL per day (3 meals)
  hotelCostPerNight: 800, // HNL per night
  exchangeRate: 24.50, // HNL per USD
  useCustomExchangeRate: false,
  preferredDistanceUnit: 'km',
  preferredCurrency: 'HNL'
};

// Validation Schemas (for use with Zod)
export interface ValidationSchema {
  groupSize: {
    min: number;
    max: number;
  };
  extraMileage: {
    min: number;
    max: number;
  };
  fuelEfficiency: {
    min: number;
    max: number;
  };
}

export const VALIDATION_LIMITS: ValidationSchema = {
  groupSize: {
    min: 1,
    max: 50
  },
  extraMileage: {
    min: 0,
    max: 1000
  },
  fuelEfficiency: {
    min: 1,
    max: 100
  }
};

// Import the SystemParameters type
import { SystemParameters } from './index';