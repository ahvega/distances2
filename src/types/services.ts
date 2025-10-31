// Service Interface Definitions
import {
  RouteResult,
  DistanceMatrixResult,
  DetailedCosts,
  CostCalculationRequest,
  FuelCosts,
  DriverExpenses,
  VehicleCosts,
  Vehicle,
  SystemParameters
} from './index';

// Route Calculator Service Interface
export interface RouteCalculatorService {
  calculateRoute(origin: string, destination: string, baseLocation: string): Promise<RouteResult>;
  getDistanceMatrix(origins: string[], destinations: string[]): Promise<DistanceMatrixResult>;
}

// Cost Calculation Service Interface
export interface CostCalculationService {
  calculateTotalCosts(request: CostCalculationRequest): Promise<DetailedCosts>;
  calculateFuelCosts(distance: number, vehicle: Vehicle): FuelCosts;
  calculateDriverExpenses(duration: number): DriverExpenses;
  calculateVehicleCosts(distance: number, duration: number, vehicle: Vehicle): VehicleCosts;
}

// Vehicle Management Service Interface
export interface VehicleManagementService {
  getVehicles(): Vehicle[];
  getVehiclesByCapacity(minCapacity: number): Vehicle[];
  addVehicle(vehicle: Vehicle): void;
  updateVehicle(id: string, vehicle: Partial<Vehicle>): void;
  deleteVehicle(id: string): void;
}

// Parameter Management Service Interface
export interface ParameterManagementService {
  getParameters(): SystemParameters;
  updateParameter(key: string, value: number): void;
  getExchangeRate(): Promise<number>;
  setCustomExchangeRate(rate: number): void;
}

// Exchange Rate Service Interface
export interface ExchangeRateService {
  getCurrentRate(): Promise<number>;
  setCustomRate(rate: number): void;
  getCustomRate(): number | null;
  isUsingCustomRate(): boolean;
}