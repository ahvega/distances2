import { ExchangeRateService, ExchangeRates, ErrorType, AppError } from '@/types';

/**
 * Interface for exchange rate history
 */
interface ExchangeRateHistory {
  rate: number;
  timestamp: number;
  source: 'manual' | 'api' | 'file';
  reason?: string;
}

/**
 * Service for managing exchange rates between USD and HNL with manual override support
 */
export class ExchangeRateServiceImpl implements ExchangeRateService {
  private currentRate: number = 24.66; // Default HNL per USD
  private customRate: number | null = null;
  private rateHistory: ExchangeRateHistory[] = [];
  private lastApiUpdate: number = 0;
  private readonly API_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  // Storage keys
  private readonly STORAGE_KEYS = {
    CURRENT_RATE: 'exchange_rate_current',
    CUSTOM_RATE: 'exchange_rate_custom',
    RATE_HISTORY: 'exchange_rate_history'
  };

  constructor() {
    this.initializeRates();
  }

  /**
   * Initialize exchange rates from storage and data files
   */
  private async initializeRates(): Promise<void> {
    try {
      // Load from localStorage
      this.loadFromStorage();

      // Load from data files if no recent data
      if (Date.now() - this.lastApiUpdate > this.API_CACHE_DURATION) {
        await this.loadFromDataFiles();
      }
    } catch (error) {
      console.error('Failed to initialize exchange rates:', error);
    }
  }

  /**
   * Load exchange rates from localStorage
   */
  private loadFromStorage(): void {
    try {
      const storedRate = localStorage.getItem(this.STORAGE_KEYS.CURRENT_RATE);
      const storedCustomRate = localStorage.getItem(this.STORAGE_KEYS.CUSTOM_RATE);
      const storedHistory = localStorage.getItem(this.STORAGE_KEYS.RATE_HISTORY);

      if (storedRate) {
        const rateData = JSON.parse(storedRate);
        this.currentRate = rateData.rate;
        this.lastApiUpdate = rateData.timestamp || 0;
      }

      if (storedCustomRate) {
        this.customRate = JSON.parse(storedCustomRate);
      }

      if (storedHistory) {
        this.rateHistory = JSON.parse(storedHistory);
      }
    } catch (error) {
      console.error('Error loading exchange rates from storage:', error);
    }
  }

  /**
   * Save exchange rates to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_RATE, JSON.stringify({
        rate: this.currentRate,
        timestamp: this.lastApiUpdate
      }));

      if (this.customRate !== null) {
        localStorage.setItem(this.STORAGE_KEYS.CUSTOM_RATE, JSON.stringify(this.customRate));
      } else {
        localStorage.removeItem(this.STORAGE_KEYS.CUSTOM_RATE);
      }

      localStorage.setItem(this.STORAGE_KEYS.RATE_HISTORY, JSON.stringify(this.rateHistory));
    } catch (error) {
      console.error('Error saving exchange rates to storage:', error);
    }
  }

  /**
   * Load exchange rates from data files
   */
  private async loadFromDataFiles(): Promise<void> {
    try {
      const response = await fetch('/data/tasaUSD.json');
      if (!response.ok) {
        throw new Error(`Failed to load exchange rates: ${response.statusText}`);
      }

      const data: ExchangeRates = await response.json();
      const newRate = data.saleRateUSD;

      if (newRate && newRate !== this.currentRate) {
        this.updateCurrentRate(newRate, 'file', 'Loaded from data file');
      }
    } catch (error) {
      console.warn('Failed to load exchange rates from data files:', error);
    }
  }

  /**
   * Update current rate and add to history
   */
  private updateCurrentRate(rate: number, source: 'manual' | 'api' | 'file', reason?: string): void {
    const oldRate = this.currentRate;
    this.currentRate = rate;
    this.lastApiUpdate = Date.now();

    // Add to history
    this.rateHistory.push({
      rate,
      timestamp: this.lastApiUpdate,
      source,
      reason
    });

    // Keep only last 100 entries
    if (this.rateHistory.length > 100) {
      this.rateHistory = this.rateHistory.slice(-100);
    }

    this.saveToStorage();
  }

  /**
   * Get current exchange rate (custom rate takes precedence)
   */
  async getCurrentRate(): Promise<number> {
    try {
      // Return custom rate if set
      if (this.customRate !== null) {
        return this.customRate;
      }

      // Check if we need to refresh from external source
      if (Date.now() - this.lastApiUpdate > this.API_CACHE_DURATION) {
        await this.refreshFromExternalSource();
      }

      return this.currentRate;
    } catch (error) {
      throw this.handleError(error, 'Failed to get current exchange rate');
    }
  }

  /**
   * Set custom exchange rate (manual override)
   */
  setCustomRate(rate: number): void {
    try {
      this.validateRate(rate);

      this.customRate = rate;
      this.saveToStorage();

      // Add to history
      this.rateHistory.push({
        rate,
        timestamp: Date.now(),
        source: 'manual',
        reason: 'Custom rate set manually'
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to set custom exchange rate');
    }
  }

  /**
   * Get custom exchange rate
   */
  getCustomRate(): number | null {
    return this.customRate;
  }

  /**
   * Check if using custom exchange rate
   */
  isUsingCustomRate(): boolean {
    return this.customRate !== null;
  }

  /**
   * Clear custom exchange rate (revert to API/file rates)
   */
  clearCustomRate(): void {
    this.customRate = null;
    this.saveToStorage();

    this.rateHistory.push({
      rate: this.currentRate,
      timestamp: Date.now(),
      source: 'api',
      reason: 'Custom rate cleared, reverted to default'
    });
  }

  /**
   * Refresh exchange rate from external source
   */
  async refreshFromExternalSource(): Promise<number> {
    try {
      // Try to fetch from external API (placeholder for real API)
      await this.loadFromDataFiles();

      // In a real implementation, you would call an external exchange rate API here
      // For now, we'll use the data file as the source

      return this.currentRate;
    } catch (error) {
      console.warn('Failed to refresh from external source:', error);
      return this.currentRate;
    }
  }

  /**
   * Get exchange rate history
   */
  getRateHistory(limit?: number): ExchangeRateHistory[] {
    let history = [...this.rateHistory];

    // Sort by timestamp (most recent first)
    history.sort((a, b) => b.timestamp - a.timestamp);

    if (limit) {
      history = history.slice(0, limit);
    }

    return history;
  }

  /**
   * Convert amount from USD to HNL
   */
  async convertUSDToHNL(usdAmount: number): Promise<number> {
    try {
      const rate = await this.getCurrentRate();
      return Math.round((usdAmount * rate) * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      throw this.handleError(error, 'Failed to convert USD to HNL');
    }
  }

  /**
   * Convert amount from HNL to USD
   */
  async convertHNLToUSD(hnlAmount: number): Promise<number> {
    try {
      const rate = await this.getCurrentRate();
      return Math.round((hnlAmount / rate) * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      throw this.handleError(error, 'Failed to convert HNL to USD');
    }
  }

  /**
   * Get exchange rate statistics
   */
  getRateStatistics(): {
    currentRate: number;
    isCustom: boolean;
    lastUpdate: number;
    averageRate: number;
    rateRange: { min: number; max: number };
    totalUpdates: number;
  } {
    const rates = this.rateHistory.map(h => h.rate);

    return {
      currentRate: this.customRate || this.currentRate,
      isCustom: this.customRate !== null,
      lastUpdate: this.lastApiUpdate,
      averageRate: rates.length > 0 ? Math.round((rates.reduce((sum, rate) => sum + rate, 0) / rates.length) * 100) / 100 : this.currentRate,
      rateRange: rates.length > 0 ? {
        min: Math.min(...rates),
        max: Math.max(...rates)
      } : { min: this.currentRate, max: this.currentRate },
      totalUpdates: this.rateHistory.length
    };
  }

  /**
   * Validate exchange rate value
   */
  private validateRate(rate: number): void {
    if (typeof rate !== 'number' || isNaN(rate)) {
      throw new Error('Exchange rate must be a valid number');
    }

    if (rate <= 0) {
      throw new Error('Exchange rate must be greater than 0');
    }

    if (rate < 10 || rate > 50) {
      throw new Error('Exchange rate seems unrealistic (should be between 10 and 50 HNL per USD)');
    }
  }

  /**
   * Handle and transform errors into AppError format
   */
  private handleError(error: any, message: string): AppError {
    console.error('ExchangeRateService error:', error);

    if (error.message?.includes('unrealistic') || error.message?.includes('must be')) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: `${message}: ${error.message}`,
        details: error
      };
    }

    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: `${message}: Network error while fetching exchange rates`,
        details: error
      };
    }

    if (error.message?.includes('API') || error.message?.includes('response')) {
      return {
        type: ErrorType.API_ERROR,
        message: `${message}: External API error`,
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
   * Force refresh exchange rate (useful for admin operations)
   */
  async forceRefresh(): Promise<number> {
    try {
      this.lastApiUpdate = 0; // Force refresh
      return await this.refreshFromExternalSource();
    } catch (error) {
      throw this.handleError(error, 'Failed to force refresh exchange rate');
    }
  }

  /**
   * Export exchange rate data for backup
   */
  exportData(): {
    currentRate: number;
    customRate: number | null;
    history: ExchangeRateHistory[];
    lastUpdate: number;
  } {
    return {
      currentRate: this.currentRate,
      customRate: this.customRate,
      history: this.getRateHistory(),
      lastUpdate: this.lastApiUpdate
    };
  }

  /**
   * Import exchange rate data from backup
   */
  importData(data: {
    currentRate: number;
    customRate: number | null;
    history: ExchangeRateHistory[];
    lastUpdate: number;
  }): void {
    try {
      this.validateRate(data.currentRate);

      if (data.customRate !== null) {
        this.validateRate(data.customRate);
      }

      this.currentRate = data.currentRate;
      this.customRate = data.customRate;
      this.rateHistory = data.history || [];
      this.lastApiUpdate = data.lastUpdate || Date.now();

      this.saveToStorage();
    } catch (error) {
      throw this.handleError(error, 'Failed to import exchange rate data');
    }
  }
}

// Export singleton instance
export const exchangeRateService = new ExchangeRateServiceImpl();