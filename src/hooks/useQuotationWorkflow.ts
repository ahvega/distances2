'use client';

import { useState, useCallback } from 'react';
import { routeCalculatorService } from '@/services/RouteCalculatorService';
import { costCalculationService } from '@/services/CostCalculationService';
import { vehicleManagementService } from '@/services/VehicleManagementService';
import { useParameterManagement } from '@/hooks/useParameterManagement';
import type {
  QuotationRequest,
  QuotationResult,
  Vehicle,
  PricingOption,
  RouteResult,
  DetailedCosts,
  AppError
} from '@/types';
import { ErrorType } from '@/types';

interface QuotationWorkflowState {
  loading: boolean;
  error: string | null;
  progress: number;
  currentStep: 'idle' | 'validating' | 'calculating-route' | 'calculating-costs' | 'generating-pricing' | 'complete';
  result: QuotationResult | null;
}

interface UseQuotationWorkflowReturn {
  state: QuotationWorkflowState;
  generateQuotation: (request: QuotationRequest) => Promise<void>;
  selectVehicle: (vehicleId: string) => Promise<void>;
  reset: () => void;
  getAvailableVehicles: (groupSize: number) => Vehicle[];
}

/**
 * Hook that orchestrates the complete quotation process
 * Integrates RouteCalculatorService, CostCalculationService, and vehicle selection
 */
export function useQuotationWorkflow(): UseQuotationWorkflowReturn {
  const { parameters, refreshParameters } = useParameterManagement();

  const [state, setState] = useState<QuotationWorkflowState>({
    loading: false,
    error: null,
    progress: 0,
    currentStep: 'idle',
    result: null
  });

  /**
   * Update workflow state
   */
  const updateState = useCallback((updates: Partial<QuotationWorkflowState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Handle workflow errors
   */
  const handleError = useCallback((error: any, step: string) => {
    console.error(`Quotation workflow error at ${step}:`, error);

    let errorMessage = 'An unexpected error occurred';

    if (error.type === ErrorType.LOCATION_NOT_FOUND) {
      errorMessage = 'One or more locations could not be found. Please check your addresses.';
    } else if (error.type === ErrorType.API_ERROR) {
      errorMessage = 'Unable to connect to mapping services. Please try again.';
    } else if (error.type === ErrorType.NETWORK_ERROR) {
      errorMessage = 'Network connection error. Please check your internet connection.';
    } else if (error.type === ErrorType.CALCULATION_ERROR) {
      errorMessage = 'Error calculating costs. Please verify your inputs.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    updateState({
      loading: false,
      error: errorMessage,
      currentStep: 'idle',
      progress: 0
    });
  }, [updateState]);

  /**
   * Generate pricing options with different markup percentages
   */
  const generatePricingOptions = useCallback((baseCost: number, exchangeRate: number): PricingOption[] => {
    const markupPercentages = [10, 15, 20, 25, 30];

    return markupPercentages.map(markup => {
      const salePrice = baseCost * (1 + markup / 100);
      const salePriceUSD = salePrice / exchangeRate;

      return {
        markup,
        cost: Math.round(baseCost * 100) / 100,
        salePrice: Math.round(salePrice * 100) / 100,
        salePriceUSD: Math.round(salePriceUSD * 100) / 100,
        salePriceHNL: Math.round(salePrice * 100) / 100,
        recommended: markup === 15 // 15% is the recommended markup
      };
    });
  }, []);

  /**
   * Get available vehicles filtered by group size capacity
   */
  const getAvailableVehicles = useCallback((groupSize: number): Vehicle[] => {
    return vehicleManagementService.getVehiclesByCapacity(groupSize);
  }, []);

  /**
   * Main quotation generation workflow
   */
  const generateQuotation = useCallback(async (request: QuotationRequest) => {
    try {
      // Reset state and start workflow
      updateState({
        loading: true,
        error: null,
        progress: 0,
        currentStep: 'validating',
        result: null
      });

      // Step 1: Validate inputs and get available vehicles
      updateState({ progress: 10, currentStep: 'validating' });

      const availableVehicles = getAvailableVehicles(request.groupSize);
      if (availableVehicles.length === 0) {
        throw new Error(`No vehicles available for group size of ${request.groupSize} passengers`);
      }

      // Select the first available vehicle (can be changed later with selectVehicle)
      const selectedVehicle = availableVehicles[0];

      // Step 2: Calculate route using RouteCalculatorService
      updateState({ progress: 30, currentStep: 'calculating-route' });

      const route = await routeCalculatorService.calculateRoute(
        request.origin,
        request.destination,
        request.baseLocation
      );

      // Step 3: Calculate detailed costs
      updateState({ progress: 60, currentStep: 'calculating-costs' });

      const costs = await costCalculationService.calculateTotalCosts({
        route,
        vehicle: selectedVehicle,
        groupSize: request.groupSize,
        extraMileage: request.extraMileage || 0
      });

      // Step 4: Generate pricing options
      updateState({ progress: 80, currentStep: 'generating-pricing' });

      // Ensure we have current parameters
      await refreshParameters();

      const pricing = generatePricingOptions(costs.total, parameters.exchangeRate);

      // Step 5: Complete quotation result
      updateState({ progress: 100, currentStep: 'complete' });

      const result: QuotationResult = {
        route,
        costs,
        vehicle: selectedVehicle,
        pricing,
        parameters
      };

      updateState({
        loading: false,
        result,
        progress: 100,
        currentStep: 'complete'
      });

    } catch (error) {
      handleError(error, state.currentStep);
    }
  }, [updateState, getAvailableVehicles, generatePricingOptions, refreshParameters, parameters.exchangeRate, handleError, state.currentStep]);

  /**
   * Select a different vehicle and recalculate costs
   */
  const selectVehicle = useCallback(async (vehicleId: string) => {
    if (!state.result) {
      throw new Error('No quotation result available to update vehicle');
    }

    try {
      updateState({ loading: true, error: null, currentStep: 'calculating-costs' });

      // Find the selected vehicle
      const vehicles = vehicleManagementService.getVehicles();
      const selectedVehicle = vehicles.find(v => v.id === vehicleId);

      if (!selectedVehicle) {
        throw new Error(`Vehicle with ID ${vehicleId} not found`);
      }

      // Recalculate costs with new vehicle
      const costs = await costCalculationService.calculateTotalCosts({
        route: state.result.route,
        vehicle: selectedVehicle,
        groupSize: 1, // This should be stored from original request
        extraMileage: 0 // This should be stored from original request
      });

      // Regenerate pricing options
      const pricing = generatePricingOptions(costs.total, state.result.parameters.exchangeRate);

      // Update result with new vehicle, costs, and pricing
      const updatedResult: QuotationResult = {
        ...state.result,
        vehicle: selectedVehicle,
        costs,
        pricing
      };

      updateState({
        loading: false,
        result: updatedResult,
        currentStep: 'complete'
      });

    } catch (error) {
      handleError(error, 'vehicle-selection');
    }
  }, [state.result, updateState, generatePricingOptions, handleError]);

  /**
   * Reset the workflow to initial state
   */
  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      progress: 0,
      currentStep: 'idle',
      result: null
    });
  }, []);

  return {
    state,
    generateQuotation,
    selectVehicle,
    reset,
    getAvailableVehicles
  };
}