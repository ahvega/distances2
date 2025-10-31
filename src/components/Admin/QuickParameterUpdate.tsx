'use client';

import React, { useState } from 'react';
import { Dialog, Input, Select, Button } from '@/components/ui';
import { parameterManagementService } from '@/services/ParameterManagementService';
import type { SystemParameters } from '@/types';

interface QuickParameterUpdateProps {
  parameterKey: keyof SystemParameters;
  currentValue: number | string | boolean;
  onUpdate?: (newValue: any) => void;
  onClose?: () => void;
}

export default function QuickParameterUpdate({
  parameterKey,
  currentValue,
  onUpdate,
  onClose
}: QuickParameterUpdateProps) {
  const [value, setValue] = useState(currentValue);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const getParameterInfo = () => {
    const infoMap: Record<string, {
      title: string;
      icon: string;
      unit: string;
      type: 'number' | 'boolean' | 'select' | 'text';
      min?: number;
      step?: number;
      options?: { value: string; label: string }[];
    }> = {
      fuelPrice: {
        title: 'Fuel Price',
        icon: 'fa-gas-pump',
        unit: 'HNL per gallon',
        type: 'number',
        min: 0.01,
        step: 0.01
      },
      mealCostPerDay: {
        title: 'Meal Cost per Day',
        icon: 'fa-utensils',
        unit: 'HNL per day',
        type: 'number',
        min: 0,
        step: 0.01
      },
      hotelCostPerNight: {
        title: 'Hotel Cost per Night',
        icon: 'fa-bed',
        unit: 'HNL per night',
        type: 'number',
        min: 0,
        step: 0.01
      },
      exchangeRate: {
        title: 'Exchange Rate',
        icon: 'fa-exchange-alt',
        unit: 'HNL per USD',
        type: 'number',
        min: 0.01,
        step: 0.01
      },
      useCustomExchangeRate: {
        title: 'Use Custom Exchange Rate',
        icon: 'fa-toggle-on',
        unit: '',
        type: 'boolean'
      },
      preferredDistanceUnit: {
        title: 'Preferred Distance Unit',
        icon: 'fa-ruler',
        unit: '',
        type: 'select',
        options: [
          { value: 'km', label: 'Kilometers' },
          { value: 'mile', label: 'Miles' }
        ]
      },
      preferredCurrency: {
        title: 'Preferred Currency',
        icon: 'fa-money-bill',
        unit: '',
        type: 'select',
        options: [
          { value: 'HNL', label: 'Honduran Lempira' },
          { value: 'USD', label: 'US Dollar' }
        ]
      }
    };

    return infoMap[parameterKey] || {
      title: parameterKey,
      icon: 'fa-edit',
      unit: '',
      type: 'text' as const
    };
  };

  const parameterInfo = getParameterInfo();

  const handleSave = async () => {
    try {
      setSaving(true);

      if (parameterInfo.type === 'number') {
        const numValue = parseFloat(value as string);
        if (isNaN(numValue)) {
          alert('Please enter a valid number');
          return;
        }
        parameterManagementService.updateParameter(
          parameterKey as string,
          numValue,
          reason || `Quick update: ${parameterInfo.title}`
        );
        onUpdate?.(numValue);
      } else {
        // Handle non-numeric parameters
        const updates = { [parameterKey]: value };
        parameterManagementService.updateParameters(
          updates,
          reason || `Quick update: ${parameterInfo.title}`
        );
        onUpdate?.(value);
      }

      onClose?.();
    } catch (error) {
      console.error('Failed to update parameter:', error);
      alert('Failed to update parameter. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = () => {
    switch (parameterInfo.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={String(value ?? '')}
            onChange={(e) => setValue((e.target as HTMLInputElement).value)}
            min={parameterInfo.min || 0}
            step={parameterInfo.step || 0.01}
            disabled={saving}
            fullWidth
          />
        );

      case 'boolean':
        return (
          <label className="inline-flex items-center gap-2">
            <span className="text-sm">Enable</span>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-blue-600"
              checked={value as boolean}
              onChange={(e) => setValue(e.target.checked)}
              disabled={saving}
            />
          </label>
        );

      case 'select':
        return (
          <select
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            disabled={saving}
          >
            {parameterInfo.options?.map((option: { value: string; label: string }) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <Input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => setValue((e.target as HTMLInputElement).value)}
            disabled={saving}
            fullWidth
          />
        );
    }
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(o) => !o && onClose?.()}
      title={`Update ${parameterInfo.title}`}
      description={parameterInfo.unit}
      footer={
        <>
          <Button onClick={onClose} className="inline-flex items-center gap-2" disabled={saving}>
            <i className="fas fa-times" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white" disabled={saving || value === currentValue}>
            <i className="fas fa-save" />
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-1">Current Value</div>
          <div className="bg-gray-100 dark:bg-gray-800/60 p-3 rounded-lg">
            <span className="font-mono">
              {typeof currentValue === 'boolean' ? (currentValue ? 'Enabled' : 'Disabled') : currentValue}
              {parameterInfo.unit && ` ${parameterInfo.unit}`}
            </span>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-1">New Value</div>
          {renderInput()}
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Reason (Optional)</div>
          <textarea
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            placeholder="Describe the reason for this change..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            disabled={saving}
          />
        </div>
      </div>
    </Dialog>
  );
}
