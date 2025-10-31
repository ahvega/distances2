import {
  CostCalculationService,
  DetailedCosts,
  CostCalculationRequest,
  FuelCosts,
  DriverExpenses,
  VehicleCosts,
  RefuelingCosts,
  Vehicle,
  SystemParameters,
  ErrorType,
  AppError
} from '@/types';
import { convertDistance, convertFuelEfficiency } from '@/utils/unitConversion';

/**
 * Fuel calculation service
 */
export class FuelCalculator {
  /**
   * Calculate fuel costs based on distance and vehicle specifications
   */
  calculateFuelCosts(distance: number, vehicle: Vehicle, fuelPrice: number): FuelCosts {
    try {
      // Convert distance to vehicle's preferred unit
      const distanceInVehicleUnit = convertDistance(distance, 'km', vehicle.distanceUnit);

      // Convert fuel efficiency to consistent units (distance per gallon)
      const efficiencyInVehicleUnit = convertFuelEfficiency(
        vehicle.fuelEfficiency,
        vehicle.fuelEfficiencyUnit,
        `${vehicle.distanceUnit}pg` as any
      );

      // Calculate fuel consumption in gallons
      const consumption = distanceInVehicleUnit / efficiencyInVehicleUnit;

      // Calculate total fuel cost
      const cost = consumption * fuelPrice;

      return {
        consumption: Math.round(consumption * 100) / 100, // Round to 2 decimal places
        cost: Math.round(cost * 100) / 100,
        pricePerUnit: fuelPrice
      };
    } catch (error) {
      throw new Error(`Fuel cost calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate refueling costs for long-distance trips
   */
  calculateRefuelingCosts(distance: number, vehicle: Vehicle, fuelPrice: number): RefuelingCosts {
    try {
      // Convert distance to vehicle's preferred unit
      const distanceInVehicleUnit = convertDistance(distance, 'km', vehicle.distanceUnit);

      // Calculate vehicle autonomy (range per tank)
      const efficiencyInVehicleUnit = convertFuelEfficiency(
        vehicle.fuelEfficiency,
        vehicle.fuelEfficiencyUnit,
        `${vehicle.distanceUnit}pg` as any
      );
      const autonomy = vehicle.fuelCapacity * efficiencyInVehicleUnit;

      // Calculate number of refueling stops needed
      const stops = Math.max(0, Math.floor(distanceInVehicleUnit / autonomy) - 1);

      // Cost per refueling stop (full tank)
      const costPerStop = vehicle.fuelCapacity * fuelPrice;

      const total = stops * costPerStop;

      return {
        stops,
        costPerStop: Math.round(costPerStop * 100) / 100,
        total: Math.round(total * 100) / 100
      };
    } catch (error) {
      throw new Error(`Refueling cost calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Driver expense calculation service
 */
export class DriverExpenseCalculator {
  /**
   * Calculate driver expenses based on trip duration
   */
  calculateDriverExpenses(duration: number, parameters: SystemParameters): DriverExpenses {
    try {
      // Convert duration from minutes to days (assuming 8-hour working days)
      const days = Math.ceil(duration / (8 * 60));

      // Calculate meal costs (3 meals per day)
      const meals = days * parameters.mealCostPerDay;

      // Calculate lodging costs (only if trip is more than 1 day)
      const lodging = days > 1 ? (days - 1) * parameters.hotelCostPerNight : 0;

      const total = meals + lodging;

      return {
        meals: Math.round(meals * 100) / 100,
        lodging: Math.round(lodging * 100) / 100,
        days,
        total: Math.round(total * 100) / 100
      };
    } catch (error) {
      throw new Error(`Driver expense calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Vehicle cost calculation service
 */
export class VehicleCostCalculator {
  /**
   * Calculate vehicle operational costs
   */
  calculateVehicleCosts(distance: number, duration: number, vehicle: Vehicle): VehicleCosts {
    try {
      // Convert distance to vehicle's preferred unit
      const distanceInVehicleUnit = convertDistance(distance, 'km', vehicle.distanceUnit);

      // Convert duration from minutes to days
      const days = Math.ceil(duration / (24 * 60));

      // Calculate distance-based costs
      const distanceCost = distanceInVehicleUnit * vehicle.costPerDistance;

      // Calculate daily costs
      const dailyCost = days * vehicle.costPerDay;

      const total = distanceCost + dailyCost;

      return {
        distanceCost: Math.round(distanceCost * 100) / 100,
        dailyCost: Math.round(dailyCost * 100) / 100,
        total: Math.round(total * 100) / 100
      };
    } catch (error) {
      throw new Error(`Vehicle cost calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Comprehensive cost calculation service that integrates all cost components
 */
export class CostCalculationServiceImpl implements CostCalculationService {
  private fuelCalculator: FuelCalculator;
  private driverExpenseCalculator: DriverExpenseCalculator;
  private vehicleCostCalculator: VehicleCostCalculator;

  constructor() {
    this.fuelCalculator = new FuelCalculator();
    this.driverExpenseCalculator = new DriverExpenseCalculator();
    this.vehicleCostCalculator = new VehicleCostCalculator();
  }

  /**
   * Calculate total costs for a transportation request
   */
  async calculateTotalCosts(request: CostCalculationRequest): Promise<DetailedCosts> {
    try {
      // Get system parameters (this would typically come from ParameterManagementService)
      const parameters: SystemParameters = {
        fuelPrice: 100, // Default values - should be injected
        mealCostPerDay: 450, // 3 meals * 150 Lps
        hotelCostPerNight: 700,
        exchangeRate: 24.66,
        useCustomExchangeRate: false,
        preferredDistanceUnit: 'km',
        preferredCurrency: 'HNL'
      };

      const { route, vehicle, extraMileage = 0 } = request;
      const totalDistance = route.totalDistance + extraMileage;

      // Calculate all cost components
      const fuel = this.calculateFuelCosts(totalDistance, vehicle, parameters.fuelPrice);
      const driver = this.calculateDriverExpenses(route.totalTime, parameters);
      const vehicleCosts = this.calculateVehicleCosts(totalDistance, route.totalTime, vehicle);
      const refueling = this.fuelCalculator.calculateRefuelingCosts(totalDistance, vehicle, parameters.fuelPrice);

      // Calculate total cost
      const total = fuel.cost + driver.total + vehicleCosts.total + refueling.total;

      return {
        fuel,
        driver,
        vehicle: vehicleCosts,
        refueling,
        total: Math.round(total * 100) / 100
      };

    } catch (error) {
      throw this.handleError(error, 'Failed to calculate total costs');
    }
  }

  /**
   * Calculate fuel costs using the fuel calculator
   */
  calculateFuelCosts(distance: number, vehicle: Vehicle, fuelPrice?: number): FuelCosts {
    const price = fuelPrice || 100; // Default fuel price
    return this.fuelCalculator.calculateFuelCosts(distance, vehicle, price);
  }

  /**
   * Calculate driver expenses using the driver expense calculator
   */
  calculateDriverExpenses(duration: number, parameters?: SystemParameters): DriverExpenses {
    const params = parameters || {
      fuelPrice: 100,
      mealCostPerDay: 450,
      hotelCostPerNight: 700,
      exchangeRate: 24.66,
      useCustomExchangeRate: false,
      preferredDistanceUnit: 'km' as const,
      preferredCurrency: 'HNL' as const
    };
    return this.driverExpenseCalculator.calculateDriverExpenses(duration, params);
  }

  /**
   * Calculate vehicle costs using the vehicle cost calculator
   */
  calculateVehicleCosts(distance: number, duration: number, vehicle: Vehicle): VehicleCosts {
    return this.vehicleCostCalculator.calculateVehicleCosts(distance, duration, vehicle);
  }

  /**
   * Handle and transform errors into AppError format
   */
  private handleError(error: any, message: string): AppError {
    console.error('CostCalculationService error:', error);

    return {
      type: ErrorType.CALCULATION_ERROR,
      message: `${message}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    };
  }
}

// Export singleton instances
export const costCalculationService = new CostCalculationServiceImpl();
export const fuelCalculator = new FuelCalculator();
export const driverExpenseCalculator = new DriverExpenseCalculator();
export const vehicleCostCalculator = new VehicleCostCalculator();