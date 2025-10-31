'use client';

import React, { useState, useEffect } from 'react';
import { Input, Button, Panel } from '@/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { parameterManagementService } from '@/services/ParameterManagementService';
import type { SystemParameters } from '@/types';
import FormField from '../Forms/FormField';
import ParameterHistory from './ParameterHistory';

// Validation schema for parameter updates
const parameterUpdateSchema = z.object({
  fuelPrice: z.number().min(0.01, 'Fuel price must be greater than 0'),
  mealCostPerDay: z.number().min(0, 'Meal cost cannot be negative'),
  hotelCostPerNight: z.number().min(0, 'Hotel cost cannot be negative'),
  exchangeRate: z.number().min(0.01, 'Exchange rate must be greater than 0'),
  useCustomExchangeRate: z.boolean(),
  preferredDistanceUnit: z.enum(['km', 'mile']),
  preferredCurrency: z.enum(['USD', 'HNL'])
});

type ParameterUpdateData = z.infer<typeof parameterUpdateSchema>;

interface ParameterManagementProps {
  onParametersUpdated?: (parameters: SystemParameters) => void;
}

export default function ParameterManagement({ onParametersUpdated }: ParameterManagementProps) {
  const [parameters, setParameters] = useState<SystemParameters | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [updateReason, setUpdateReason] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<ParameterUpdateData>({
    resolver: zodResolver(parameterUpdateSchema)
  });

  const useCustomExchangeRate = watch('useCustomExchangeRate');

  // Load current parameters
  useEffect(() => {
    loadParameters();
  }, []);

  const loadParameters = async () => {
    try {
      setLoading(true);
      const currentParams = parameterManagementService.getParameters();
      setParameters(currentParams);

      // Set form values
      reset(currentParams);
    } catch (error) {
      console.error('Failed to load parameters:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ParameterUpdateData) => {
    try {
      setSaving(true);

      // Update parameters
      parameterManagementService.updateParameters(data, updateReason || 'Parameter update via admin interface');

      // Reload parameters
      const updatedParams = parameterManagementService.getParameters();
      setParameters(updatedParams);

      // Notify parent component
      onParametersUpdated?.(updatedParams);

      // Clear update reason
      setUpdateReason('');

      // Reset form dirty state
      reset(updatedParams);

    } catch (error) {
      console.error('Failed to update parameters:', error);
      alert('Failed to update parameters. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all parameters to default values? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      parameterManagementService.resetToDefaults('Reset to default values via admin interface');

      const updatedParams = parameterManagementService.getParameters();
      setParameters(updatedParams);
      reset(updatedParams);

      onParametersUpdated?.(updatedParams);
    } catch (error) {
      console.error('Failed to reset parameters:', error);
      alert('Failed to reset parameters. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFetchExchangeRate = async () => {
    try {
      setSaving(true);
      const currentRate = await parameterManagementService.getExchangeRate();
      setValue('exchangeRate', currentRate);
      setValue('useCustomExchangeRate', false);
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      alert('Failed to fetch current exchange rate. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-900 dark:text-gray-100">
        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading parameters...</span>
      </div>
    );
  }

  if (!parameters) {
    return (
      <div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
        <div className="flex items-center gap-2">
          <i className="fas fa-exclamation-triangle" />
          <span>Failed to load parameters. Please refresh the page.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Parameter Management</h2>
          <p className="text-base-content/70 mt-1">
            Configure system parameters for cost calculations and pricing
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="btn btn-outline btn-sm inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <i className="fas fa-history"></i>
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="btn btn-outline btn-error btn-sm inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            disabled={saving}
          >
            <i className="fas fa-undo"></i>
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Parameter Update Form */}
      <Panel className="os-window">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
            {/* Cost Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField label="Fuel Price (HNL per gallon)" icon="fa-gas-pump">
                <Input type="number" step="0.01" fullWidth {...register('fuelPrice', { valueAsNumber: true })} />
                {errors.fuelPrice && (
                  <div className="label">
                    <span className="label-text-alt text-error">{errors.fuelPrice.message}</span>
                  </div>
                )}
              </FormField>

              <FormField label="Meal Cost per Day (HNL)" icon="fa-utensils">
                <Input type="number" step="0.01" fullWidth {...register('mealCostPerDay', { valueAsNumber: true })} />
                {errors.mealCostPerDay && (
                  <div className="label">
                    <span className="label-text-alt text-error">{errors.mealCostPerDay.message}</span>
                  </div>
                )}
                <div className="label">
                  <span className="label-text-alt">Covers 3 meals per day</span>
                </div>
              </FormField>

              <FormField label="Hotel Cost per Night (HNL)" icon="fa-bed">
                <Input type="number" step="0.01" fullWidth {...register('hotelCostPerNight', { valueAsNumber: true })} />
                {errors.hotelCostPerNight && (
                  <div className="label">
                    <span className="label-text-alt text-error">{errors.hotelCostPerNight.message}</span>
                  </div>
                )}
              </FormField>
            </div>

            {/* Exchange Rate Parameters */}
            <div className="divider">Exchange Rate Settings</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Exchange Rate (HNL per USD)" icon="fa-exchange-alt">
                <div className="flex gap-2">
                  <Input type="number" step="0.01" className="flex-1" fullWidth {...register('exchangeRate', { valueAsNumber: true })} disabled={!useCustomExchangeRate} />
                  <Button type="button" onClick={handleFetchExchangeRate} className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700" disabled={saving}>
                    <i className="fas fa-sync-alt" />
                  </Button>
                </div>
                {errors.exchangeRate && (
                  <div className="label">
                    <span className="label-text-alt text-error">{errors.exchangeRate.message}</span>
                  </div>
                )}
              </FormField>

              <FormField label="Exchange Rate Options" icon="fa-cog">
                <label className="inline-flex items-center gap-2">
                  <span className="text-sm">Use custom exchange rate</span>
                  <input type="checkbox" className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-blue-600" {...register('useCustomExchangeRate')} />
                </label>
                <div className="label">
                  <span className="label-text-alt">
                    {useCustomExchangeRate
                      ? 'Using custom rate - uncheck to use system rate'
                      : 'Using system rate - check to set custom rate'
                    }
                  </span>
                </div>
              </FormField>
            </div>

            {/* System Preferences */}
            <div className="divider">System Preferences</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Preferred Distance Unit" icon="fa-ruler">
                <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" {...register('preferredDistanceUnit')}>
                  <option value="km">Kilometers (km)</option>
                  <option value="mile">Miles</option>
                </select>
              </FormField>

              <FormField label="Preferred Currency" icon="fa-money-bill">
                <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" {...register('preferredCurrency')}>
                  <option value="HNL">Honduran Lempira (HNL)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </FormField>
            </div>

            {/* Update Reason */}
            <FormField label="Update Reason (Optional)" icon="fa-comment">
              <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="Describe the reason for this parameter update..." value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} rows={2} />
            </FormField>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" onClick={() => reset(parameters)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700" disabled={!isDirty || saving}>
                <i className="fas fa-undo" />
                Reset Changes
              </Button>
              <Button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white" disabled={!isDirty || saving}>
                <i className="fas fa-save" />
                Save Parameters
              </Button>
            </div>
        </form>
      </Panel>

      {/* Parameter History */}
      {showHistory && (
        <ParameterHistory />
      )}
    </div>
  );
}
