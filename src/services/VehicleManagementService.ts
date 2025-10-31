import { VehicleManagementService, Vehicle, LegacyVehicle, ErrorType, AppError } from '@/types';
import { saveVehicles, getStoredVehicles } from '@/utils/storage';

/**
 * Service for managing vehicle data with CRUD operations and capacity filtering
 * Integrates with existing vehicle data loading system
 */
export class VehicleManagementServiceImpl implements VehicleManagementService {
  private vehicles: Vehicle[] = [];
  private initialized = false;

  constructor() {
    this.initializeVehicles();
  }

  /**
   * Initialize vehicles from storage or load from data files
   */
  private async initializeVehicles(): Promise<void> {
    if (this.initialized) return;

    try {
      // Try to load from localStorage first
      const storedVehicles = getStoredVehicles();
      if (storedVehicles && storedVehicles.length > 0) {
        this.vehicles = storedVehicles;
      } else {
        // Load from data files if no stored vehicles
        await this.loadVehiclesFromDataFiles();
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize vehicles:', error);
      this.vehicles = [];
      this.initialized = true;
    }
  }

  /**
   * Load vehicles from public data files and convert to new format
   */
  private async loadVehiclesFromDataFiles(): Promise<void> {
    try {
      const response = await fetch('/data/tipodevehiculo.json');
      if (!response.ok) {
        throw new Error(`Failed to load vehicles: ${response.statusText}`);
      }

      const legacyVehicles: LegacyVehicle[] = await response.json();
      this.vehicles = legacyVehicles.map(this.convertLegacyVehicle);

      // Save converted vehicles to localStorage
      this.saveVehiclesToStorage();
    } catch (error) {
      throw new Error(`Failed to load vehicles from data files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert legacy vehicle format to new Vehicle interface
   */
  private convertLegacyVehicle(legacy: LegacyVehicle): Vehicle {
    return {
      id: legacy.id.toString(),
      make: 'Toyota', // Default make - could be enhanced
      model: legacy.nombre,
      year: 2020, // Default year - could be enhanced
      passengerCapacity: legacy.capacidad_real,
      fuelCapacity: parseFloat(legacy.galones_tanque),
      fuelEfficiency: legacy.rendimiento,
      fuelEfficiencyUnit: 'kpg', // km per gallon - common in Honduras
      costPerDistance: parseFloat(legacy.costo_por_km),
      costPerDay: parseFloat(legacy.costo_por_dia),
      distanceUnit: 'km'
    };
  }

  /**
   * Save vehicles to localStorage
   */
  private saveVehiclesToStorage(): void {
    try {
      saveVehicles(this.vehicles);
    } catch (error) {
      console.error('Failed to save vehicles to storage:', error);
    }
  }

  /**
   * Ensure vehicles are initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeVehicles();
    }
  }

  /**
   * Get all vehicles
   */
  getVehicles(): Vehicle[] {
    if (!this.initialized) {
      // Return empty array if not initialized, initialization happens async
      this.initializeVehicles();
      return [];
    }
    return [...this.vehicles];
  }

  /**
   * Get vehicles filtered by minimum passenger capacity
   */
  getVehiclesByCapacity(minCapacity: number): Vehicle[] {
    if (!this.initialized) {
      this.initializeVehicles();
      return [];
    }

    return this.vehicles.filter(vehicle => vehicle.passengerCapacity >= minCapacity);
  }

  /**
   * Add a new vehicle
   */
  addVehicle(vehicle: Vehicle): void {
    try {
      // Validate vehicle data
      this.validateVehicle(vehicle);

      // Check for duplicate IDs
      if (this.vehicles.some(v => v.id === vehicle.id)) {
        throw new Error(`Vehicle with ID ${vehicle.id} already exists`);
      }

      this.vehicles.push(vehicle);
      this.saveVehiclesToStorage();
    } catch (error) {
      throw this.handleError(error, 'Failed to add vehicle');
    }
  }

  /**
   * Update an existing vehicle
   */
  updateVehicle(id: string, vehicleUpdate: Partial<Vehicle>): void {
    try {
      const index = this.vehicles.findIndex(v => v.id === id);
      if (index === -1) {
        throw new Error(`Vehicle with ID ${id} not found`);
      }

      // Merge updates with existing vehicle
      const updatedVehicle = { ...this.vehicles[index], ...vehicleUpdate };

      // Validate updated vehicle
      this.validateVehicle(updatedVehicle);

      this.vehicles[index] = updatedVehicle;
      this.saveVehiclesToStorage();
    } catch (error) {
      throw this.handleError(error, 'Failed to update vehicle');
    }
  }

  /**
   * Delete a vehicle
   */
  deleteVehicle(id: string): void {
    try {
      const index = this.vehicles.findIndex(v => v.id === id);
      if (index === -1) {
        throw new Error(`Vehicle with ID ${id} not found`);
      }

      this.vehicles.splice(index, 1);
      this.saveVehiclesToStorage();
    } catch (error) {
      throw this.handleError(error, 'Failed to delete vehicle');
    }
  }

  /**
   * Get vehicle by ID
   */
  getVehicleById(id: string): Vehicle | undefined {
    if (!this.initialized) {
      this.initializeVehicles();
      return undefined;
    }

    return this.vehicles.find(v => v.id === id);
  }

  /**
   * Get vehicles sorted by capacity
   */
  getVehiclesSortedByCapacity(ascending: boolean = true): Vehicle[] {
    const vehicles = this.getVehicles();
    return vehicles.sort((a, b) => {
      return ascending
        ? a.passengerCapacity - b.passengerCapacity
        : b.passengerCapacity - a.passengerCapacity;
    });
  }

  /**
   * Get vehicles that can accommodate a group, with multiple vehicle suggestions
   */
  getVehicleOptionsForGroup(groupSize: number): {
    singleVehicle: Vehicle[];
    multipleVehicles: { vehicles: Vehicle[]; totalCapacity: number }[];
  } {
    const allVehicles = this.getVehicles();

    // Single vehicle options
    const singleVehicle = allVehicles.filter(v => v.passengerCapacity >= groupSize);

    // Multiple vehicle combinations (simple approach - same vehicle type)
    const multipleVehicles: { vehicles: Vehicle[]; totalCapacity: number }[] = [];

    for (const vehicle of allVehicles) {
      const vehiclesNeeded = Math.ceil(groupSize / vehicle.passengerCapacity);
      if (vehiclesNeeded > 1 && vehiclesNeeded <= 3) { // Limit to reasonable combinations
        const totalCapacity = vehiclesNeeded * vehicle.passengerCapacity;
        multipleVehicles.push({
          vehicles: Array(vehiclesNeeded).fill(vehicle),
          totalCapacity
        });
      }
    }

    return { singleVehicle, multipleVehicles };
  }

  /**
   * Validate vehicle data
   */
  private validateVehicle(vehicle: Vehicle): void {
    const errors: string[] = [];

    if (!vehicle.id || vehicle.id.trim() === '') {
      errors.push('Vehicle ID is required');
    }

    if (!vehicle.make || vehicle.make.trim() === '') {
      errors.push('Vehicle make is required');
    }

    if (!vehicle.model || vehicle.model.trim() === '') {
      errors.push('Vehicle model is required');
    }

    if (vehicle.year < 1900 || vehicle.year > new Date().getFullYear() + 1) {
      errors.push('Vehicle year must be valid');
    }

    if (vehicle.passengerCapacity <= 0) {
      errors.push('Passenger capacity must be greater than 0');
    }

    if (vehicle.fuelCapacity <= 0) {
      errors.push('Fuel capacity must be greater than 0');
    }

    if (vehicle.fuelEfficiency <= 0) {
      errors.push('Fuel efficiency must be greater than 0');
    }

    if (!['mpg', 'mpl', 'kpl', 'kpg'].includes(vehicle.fuelEfficiencyUnit)) {
      errors.push('Invalid fuel efficiency unit');
    }

    if (vehicle.costPerDistance < 0) {
      errors.push('Cost per distance cannot be negative');
    }

    if (vehicle.costPerDay < 0) {
      errors.push('Cost per day cannot be negative');
    }

    if (!['km', 'mile'].includes(vehicle.distanceUnit)) {
      errors.push('Invalid distance unit');
    }

    if (errors.length > 0) {
      throw new Error(`Vehicle validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Handle and transform errors into AppError format
   */
  private handleError(error: any, message: string): AppError {
    console.error('VehicleManagementService error:', error);

    if (error.message?.includes('validation')) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: `${message}: ${error.message}`,
        details: error
      };
    }

    if (error.message?.includes('not found')) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: `${message}: ${error.message}`,
        details: error
      };
    }

    return {
      type: ErrorType.CALCULATION_ERROR,
      message: `${message}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    };
  }

  /**
   * Refresh vehicles from data files (useful for admin operations)
   */
  async refreshVehiclesFromDataFiles(): Promise<void> {
    try {
      await this.loadVehiclesFromDataFiles();
    } catch (error) {
      throw this.handleError(error, 'Failed to refresh vehicles from data files');
    }
  }

  /**
   * Get vehicle statistics
   */
  getVehicleStatistics(): {
    totalVehicles: number;
    averageCapacity: number;
    capacityRange: { min: number; max: number };
    fuelEfficiencyRange: { min: number; max: number };
  } {
    const vehicles = this.getVehicles();

    if (vehicles.length === 0) {
      return {
        totalVehicles: 0,
        averageCapacity: 0,
        capacityRange: { min: 0, max: 0 },
        fuelEfficiencyRange: { min: 0, max: 0 }
      };
    }

    const capacities = vehicles.map(v => v.passengerCapacity);
    const efficiencies = vehicles.map(v => v.fuelEfficiency);

    return {
      totalVehicles: vehicles.length,
      averageCapacity: Math.round(capacities.reduce((sum, cap) => sum + cap, 0) / vehicles.length),
      capacityRange: {
        min: Math.min(...capacities),
        max: Math.max(...capacities)
      },
      fuelEfficiencyRange: {
        min: Math.min(...efficiencies),
        max: Math.max(...efficiencies)
      }
    };
  }
}

// Export singleton instance
export const vehicleManagementService = new VehicleManagementServiceImpl();