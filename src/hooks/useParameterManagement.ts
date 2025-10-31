'use client';

import { useState, useEffect, useCallback } from 'react';
import { parameterManagementService } from '@/services/ParameterManagementService';
import { useAppContext } from '@/context/AppContext';
import type { SystemParameters } from '@/types';

interface UseParameterManagementReturn {
  parameters: SystemParameters;
  loading: boolean;
  error: string | null;
  updateParameter: (key: string, value: number, reason?: string) => Promise<void>;
  updateParameters: (updates: Partial<SystemParameters>, reason?: string) => Promise<void>;
  resetToDefaults: (reason?: string) => Promise<void>;
  getExchangeRate: () => Promise<number>;
  setCustomExchangeRate: (rate: number) => Promise<void>;
  getChangeHistory: (parameterKey?: string, limit?: number) => any[];
  refreshParameters: () => Promise<void>;
}

export function useParameterManagement(): UseParameterManagementReturn {
  const { state, dispatch } = useAppContext();
  const [parameters, setParameters] = useState<SystemParameters>(() =>
    parameterManagementService.getParameters()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load parameters on mount
  useEffect(() => {
    refreshParameters();
  }, []);

  // Listen to cross-tab and same-tab parameter updates
  useEffect(() => {
    const onStorage = (e: any) => {
      try {
        // If specific key changed or generic signal
        if (!e || !e.key || e.key.includes('transportation_system_parameters')) {
          refreshParameters();
        }
      } catch {}
    };
    const onCustom = () => refreshParameters();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
      window.addEventListener('parameters:updated', onCustom as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('parameters:updated', onCustom as EventListener);
      }
    };
  }, [refreshParameters]);

  const refreshParameters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentParams = parameterManagementService.getParameters();
      setParameters(currentParams);

      // Update AppContext options to maintain compatibility with legacy system
      dispatch({
        type: 'UPDATE_OPTIONS',
        payload: {
          precioFuel: currentParams.fuelPrice,
          ventaUSD: currentParams.exchangeRate,
          compraUSD: currentParams.exchangeRate - 0.02 // Slight difference for buy rate
        }
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load parameters';
      setError(errorMessage);
      console.error('Failed to refresh parameters:', err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateParameter = useCallback(async (key: string, value: number, reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      parameterManagementService.updateParameter(key, value, reason);

      // Refresh parameters to get updated values
      await refreshParameters();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update parameter';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshParameters]);

  const updateParameters = useCallback(async (updates: Partial<SystemParameters>, reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      parameterManagementService.updateParameters(updates, reason);

      // Refresh parameters to get updated values
      await refreshParameters();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update parameters';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshParameters]);

  const resetToDefaults = useCallback(async (reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      parameterManagementService.resetToDefaults(reason);

      // Refresh parameters to get updated values
      await refreshParameters();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset parameters';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshParameters]);

  const getExchangeRate = useCallback(async (): Promise<number> => {
    try {
      return await parameterManagementService.getExchangeRate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get exchange rate';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const setCustomExchangeRate = useCallback(async (rate: number) => {
    try {
      setLoading(true);
      setError(null);

      parameterManagementService.setCustomExchangeRate(rate);

      // Refresh parameters to get updated values
      await refreshParameters();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set custom exchange rate';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshParameters]);

  const getChangeHistory = useCallback((parameterKey?: string, limit?: number) => {
    try {
      return parameterManagementService.getChangeHistory(parameterKey, limit);
    } catch (err) {
      console.error('Failed to get change history:', err);
      return [];
    }
  }, []);

  return {
    parameters,
    loading,
    error,
    updateParameter,
    updateParameters,
    resetToDefaults,
    getExchangeRate,
    setCustomExchangeRate,
    getChangeHistory,
    refreshParameters
  };
}
