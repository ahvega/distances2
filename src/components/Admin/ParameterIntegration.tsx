'use client';

import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useParameterManagement } from '@/hooks/useParameterManagement';

/**
 * Component that integrates parameter management with the existing system
 * This ensures parameter changes are reflected in the AppContext and quotations
 */
export default function ParameterIntegration() {
  const { dispatch } = useAppContext();
  const { parameters } = useParameterManagement();

  // Update AppContext whenever parameters change
  useEffect(() => {
    if (parameters) {
      // Update options to maintain compatibility with legacy system
      dispatch({
        type: 'UPDATE_OPTIONS',
        payload: {
          precioFuel: parameters.fuelPrice,
          ventaUSD: parameters.exchangeRate,
          compraUSD: parameters.exchangeRate - 0.02, // Slight difference for buy rate
          // Update rounding preferences if needed
          rndLps: 100, // Keep existing rounding
          rndUSD: 5    // Keep existing rounding
        }
      });
    }
  }, [parameters, dispatch]);

  // This component doesn't render anything - it's just for integration
  return null;
}

/**
 * Hook that provides parameter integration functionality
 * Use this in components that need to ensure parameter changes are applied
 */
export function useParameterIntegration() {
  const { state, dispatch } = useAppContext();
  const { parameters, refreshParameters } = useParameterManagement();

  const syncParametersWithContext = React.useCallback(() => {
    if (parameters) {
      dispatch({
        type: 'UPDATE_OPTIONS',
        payload: {
          precioFuel: parameters.fuelPrice,
          ventaUSD: parameters.exchangeRate,
          compraUSD: parameters.exchangeRate - 0.02,
        }
      });
    }
  }, [parameters, dispatch]);

  const refreshAndSync = React.useCallback(async () => {
    await refreshParameters();
    syncParametersWithContext();
  }, [refreshParameters, syncParametersWithContext]);

  return {
    parameters,
    appOptions: state.options,
    syncParametersWithContext,
    refreshAndSync
  };
}