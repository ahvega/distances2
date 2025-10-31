import { ParameterManagementService, SystemParameters, Parameter, ErrorType, AppError } from '@/types';

/**
 * Interface for parameter change history
 */
interface ParameterChangeHistory {
  parameterKey: string;
  oldValue: number;
  newValue: number;
  timestamp: number;
  reason?: string;
}

/**
 * Service for managing system parameters with change history and localStorage persistence
 */
export class ParameterManagementServiceImpl implements ParameterManagementService {
  private parameters: SystemParameters;
  private changeHistory: ParameterChangeHistory[] = [];
  private initialized = false;

  // Storage keys
  private readonly STORAGE_KEYS = {
    PARAMETERS: 'transportation_system_parameters',
    CHANGE_HISTORY: 'transportation_system_parameter_history'
  };

  constructor() {
    this.parameters = this.getDefaultParameters();
    this.initializeParameters();
  }

  /**
   * Get default system parameters
   */
  private getDefaultParameters(): SystemParameters {
    return {
      fuelPrice: 100, // Lps per gallon
      mealCostPerDay: 450, // 3 meals * 150 Lps
      hotelCostPerNight: 700, // Lps per night
      exchangeRate: 24.66, // HNL per USD
      useCustomExchangeRate: false,
      preferredDistanceUnit: 'km',
      preferredCurrency: 'HNL'
    };
  }

  /**
   * Initialize parameters from localStorage or load from data files
   */
  private async initializeParameters(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load from localStorage first
      const storedParams = this.loadParametersFromStorage();
      const storedHistory = this.loadChangeHistoryFromStorage();

      if (storedParams) {
        this.parameters = { ...this.getDefaultParameters(), ...storedParams };
        this.changeHistory = storedHistory || [];
      } else {
        // Load from data files if no stored parameters
        await this.loadParametersFromDataFiles();
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize parameters:', error);
      this.parameters = this.getDefaultParameters();
      this.initialized = true;
    }
  }

  /**
   * Load parameters from public data files
   */
  private async loadParametersFromDataFiles(): Promise<void> {
    try {
      const response = await fetch('/data/parametro.json');
      if (!response.ok) {
        throw new Error(`Failed to load parameters: ${response.statusText}`);
      }

      const legacyParameters: Parameter[] = await response.json();

      // Convert legacy parameters to new format
      const convertedParams = this.convertLegacyParameters(legacyParameters);
      this.parameters = { ...this.getDefaultParameters(), ...convertedParams };

      // Save converted parameters to localStorage
      this.saveParametersToStorage();
    } catch (error) {
      throw new Error(`Failed to load parameters from data files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert legacy parameter format to new SystemParameters interface
   */
  private convertLegacyParameters(legacyParams: Parameter[]): Partial<SystemParameters> {
    const params: Partial<SystemParameters> = {};

    // Find the most recent parameters (highest year)
    const currentYear = Math.max(...legacyParams.map(p => p.annio));
    const currentParams = legacyParams.filter(p => p.annio === currentYear);

    for (const param of currentParams) {
      const value = parseFloat(param.valor);

      switch (param.slug) {
        case `${currentYear}-precio-diesel`:
          params.fuelPrice = value;
          break;
        case `${currentYear}-alimentacion-hn`:
          params.mealCostPerDay = value * 3; // 3 meals per day
          break;
        case `${currentYear}-hotel-hn-1`:
          params.hotelCostPerNight = value;
          break;
        case `${currentYear}-tasa-venta-us`:
          params.exchangeRate = value;
          break;
      }
    }

    return params;
  }

  /**
   * Load parameters from localStorage
   */
  private loadParametersFromStorage(): SystemParameters | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.PARAMETERS);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading parameters from storage:', error);
      return null;
    }
  }

  /**
   * Load change history from localStorage
   */
  private loadChangeHistoryFromStorage(): ParameterChangeHistory[] | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CHANGE_HISTORY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading change history from storage:', error);
      return null;
    }
  }

  /**
   * Save parameters to localStorage
   */
  private saveParametersToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.PARAMETERS, JSON.stringify(this.parameters));
    } catch (error) {
      console.error('Error saving parameters to storage:', error);
    }
  }

  /**
   * Save change history to localStorage
   */
  private saveChangeHistoryToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.CHANGE_HISTORY, JSON.stringify(this.changeHistory));
    } catch (error) {
      console.error('Error saving change history to storage:', error);
    }
  }

  /**
   * Ensure parameters are initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeParameters();
    }
  }

  /**
   * Get current system parameters
   */
  getParameters(): SystemParameters {
    if (!this.initialized) {
      this.initializeParameters();
      return this.getDefaultParameters();
    }
    return { ...this.parameters };
  }

  /**
   * Update a specific parameter
   */
  updateParameter(key: string, value: number, reason?: string): void {
    try {
      this.validateParameterKey(key);
      this.validateParameterValue(key, value);

      const oldValue = (this.parameters as any)[key];

      // Record change in history
      this.changeHistory.push({
        parameterKey: key,
        oldValue,
        newValue: value,
        timestamp: Date.now(),
        reason
      });

      // Update parameter
      (this.parameters as any)[key] = value;

      // Save to storage
      this.saveParametersToStorage();
      this.saveChangeHistoryToStorage();

    } catch (error) {
      throw this.handleError(error, 'Failed to update parameter');
    }
  }

  /**
   * Update multiple parameters at once
   */
  updateParameters(updates: Partial<SystemParameters>, reason?: string): void {
    try {
      for (const [key, value] of Object.entries(updates)) {
        if (typeof value === 'number') {
          this.updateParameter(key, value, reason);
        } else if (typeof value === 'boolean' || typeof value === 'string') {
          // Handle non-numeric parameters
          const oldValue = (this.parameters as any)[key];

          this.changeHistory.push({
            parameterKey: key,
            oldValue: typeof oldValue === 'number' ? oldValue : 0,
            newValue: typeof value === 'number' ? value : 0,
            timestamp: Date.now(),
            reason
          });

          (this.parameters as any)[key] = value;
        }
      }

      this.saveParametersToStorage();
      this.saveChangeHistoryToStorage();

    } catch (error) {
      throw this.handleError(error, 'Failed to update parameters');
    }
  }

  /**
   * Get exchange rate (placeholder for external API integration)
   */
  async getExchangeRate(): Promise<number> {
    try {
      if (this.parameters.useCustomExchangeRate) {
        return this.parameters.exchangeRate;
      }

      // Try to fetch from external API (placeholder)
      try {
        const response = await fetch('/data/tasaUSD.json');
        if (response.ok) {
          const data = await response.json();
          return data.saleRateUSD || this.parameters.exchangeRate;
        }
      } catch (error) {
        console.warn('Failed to fetch external exchange rate, using stored rate');
      }

      return this.parameters.exchangeRate;

    } catch (error) {
      throw this.handleError(error, 'Failed to get exchange rate');
    }
  }

  /**
   * Set custom exchange rate
   */
  setCustomExchangeRate(rate: number): void {
    try {
      this.validateParameterValue('exchangeRate', rate);

      this.updateParameter('exchangeRate', rate, 'Custom exchange rate set');
      this.updateParameters({ useCustomExchangeRate: true }, 'Enabled custom exchange rate');

    } catch (error) {
      throw this.handleError(error, 'Failed to set custom exchange rate');
    }
  }

  /**
   * Reset to default exchange rate (disable custom rate)
   */
  async resetToDefaultExchangeRate(): Promise<void> {
    try {
      this.updateParameters({ useCustomExchangeRate: false }, 'Disabled custom exchange rate');

      // Fetch current rate from external source
      const currentRate = await this.getExchangeRate();
      this.updateParameter('exchangeRate', currentRate, 'Reset to default exchange rate');

    } catch (error) {
      throw this.handleError(error, 'Failed to reset to default exchange rate');
    }
  }

  /**
   * Get parameter change history
   */
  getChangeHistory(parameterKey?: string, limit?: number): ParameterChangeHistory[] {
    let history = [...this.changeHistory];

    if (parameterKey) {
      history = history.filter(h => h.parameterKey === parameterKey);
    }

    // Sort by timestamp (most recent first)
    history.sort((a, b) => b.timestamp - a.timestamp);

    if (limit) {
      history = history.slice(0, limit);
    }

    return history;
  }

  /**
   * Clear change history
   */
  clearChangeHistory(): void {
    this.changeHistory = [];
    this.saveChangeHistoryToStorage();
  }

  /**
   * Reset all parameters to defaults
   */
  resetToDefaults(reason?: string): void {
    try {
      const defaults = this.getDefaultParameters();

      for (const [key, value] of Object.entries(defaults)) {
        if (typeof value === 'number') {
          this.updateParameter(key, value, reason || 'Reset to default values');
        }
      }

    } catch (error) {
      throw this.handleError(error, 'Failed to reset parameters to defaults');
    }
  }

  /**
   * Validate parameter key
   */
  private validateParameterKey(key: string): void {
    const validKeys = [
      'fuelPrice',
      'mealCostPerDay',
      'hotelCostPerNight',
      'exchangeRate',
      'useCustomExchangeRate',
      'preferredDistanceUnit',
      'preferredCurrency'
    ];

    if (!validKeys.includes(key)) {
      throw new Error(`Invalid parameter key: ${key}`);
    }
  }

  /**
   * Validate parameter value
   */
  private validateParameterValue(key: string, value: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Parameter value must be a valid number`);
    }

    switch (key) {
      case 'fuelPrice':
        if (value <= 0) throw new Error('Fuel price must be greater than 0');
        break;
      case 'mealCostPerDay':
        if (value < 0) throw new Error('Meal cost per day cannot be negative');
        break;
      case 'hotelCostPerNight':
        if (value < 0) throw new Error('Hotel cost per night cannot be negative');
        break;
      case 'exchangeRate':
        if (value <= 0) throw new Error('Exchange rate must be greater than 0');
        break;
    }
  }

  /**
   * Handle and transform errors into AppError format
   */
  private handleError(error: any, message: string): AppError {
    console.error('ParameterManagementService error:', error);

    if (error.message?.includes('Invalid') || error.message?.includes('must be')) {
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
   * Export parameters for backup
   */
  exportParameters(): { parameters: SystemParameters; history: ParameterChangeHistory[] } {
    return {
      parameters: this.getParameters(),
      history: this.getChangeHistory()
    };
  }

  /**
   * Import parameters from backup
   */
  importParameters(data: { parameters: SystemParameters; history?: ParameterChangeHistory[] }, reason?: string): void {
    try {
      this.parameters = { ...this.getDefaultParameters(), ...data.parameters };

      if (data.history) {
        this.changeHistory = data.history;
      }

      // Add import record to history
      this.changeHistory.push({
        parameterKey: 'system',
        oldValue: 0,
        newValue: 0,
        timestamp: Date.now(),
        reason: reason || 'Parameters imported from backup'
      });

      this.saveParametersToStorage();
      this.saveChangeHistoryToStorage();

    } catch (error) {
      throw this.handleError(error, 'Failed to import parameters');
    }
  }
}

// Export singleton instance
export const parameterManagementService = new ParameterManagementServiceImpl();