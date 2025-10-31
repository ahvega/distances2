// Validation Utilities
import { z } from 'zod';
import { VALIDATION_LIMITS } from '@/types/utils';

// Quotation Form Validation Schema
export const quotationFormSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  baseLocation: z.string().min(1, 'Base location is required'),
  groupSize: z.number()
    .min(VALIDATION_LIMITS.groupSize.min, `Group size must be at least ${VALIDATION_LIMITS.groupSize.min}`)
    .max(VALIDATION_LIMITS.groupSize.max, `Group size cannot exceed ${VALIDATION_LIMITS.groupSize.max}`),
  extraMileage: z.number()
    .min(VALIDATION_LIMITS.extraMileage.min, 'Extra mileage cannot be negative')
    .max(VALIDATION_LIMITS.extraMileage.max, `Extra mileage cannot exceed ${VALIDATION_LIMITS.extraMileage.max}`)
    .optional()
});

// Vehicle Validation Schema
export const vehicleSchema = z.object({
  id: z.string().min(1, 'Vehicle ID is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  passengerCapacity: z.number().min(1, 'Passenger capacity must be at least 1'),
  fuelCapacity: z.number().min(1, 'Fuel capacity must be greater than 0'),
  fuelEfficiency: z.number()
    .min(VALIDATION_LIMITS.fuelEfficiency.min, 'Fuel efficiency must be greater than 0')
    .max(VALIDATION_LIMITS.fuelEfficiency.max, 'Fuel efficiency seems too high'),
  fuelEfficiencyUnit: z.enum(['mpg', 'mpl', 'kpl', 'kpg']),
  costPerDistance: z.number().min(0, 'Cost per distance cannot be negative'),
  costPerDay: z.number().min(0, 'Cost per day cannot be negative'),
  distanceUnit: z.enum(['km', 'mile'])
});

// System Parameters Validation Schema
export const systemParametersSchema = z.object({
  fuelPrice: z.number().min(0, 'Fuel price cannot be negative'),
  mealCostPerDay: z.number().min(0, 'Meal cost cannot be negative'),
  hotelCostPerNight: z.number().min(0, 'Hotel cost cannot be negative'),
  exchangeRate: z.number().min(0, 'Exchange rate must be positive'),
  useCustomExchangeRate: z.boolean(),
  preferredDistanceUnit: z.enum(['km', 'mile']),
  preferredCurrency: z.enum(['USD', 'HNL'])
});

// Type exports for form validation
export type QuotationFormData = z.infer<typeof quotationFormSchema>;
export type VehicleFormData = z.infer<typeof vehicleSchema>;
export type SystemParametersFormData = z.infer<typeof systemParametersSchema>;