'use client';

import React, { useState } from 'react';
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
          <input
            type="number"
            className="input input-bordered w-full"
            value={value as number}
            onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
            min={parameterInfo.min || 0}
            step={parameterInfo.step || 0.01}
            disabled={saving}
          />
        );

      case 'boolean':
        return (
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Enable</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={value as boolean}
                onChange={(e) => setValue(e.target.checked)}
                disabled={saving}
              />
            </label>
          </div>
        );

      case 'select':
        return (
          <select
            className="select select-bordered w-full"
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
          <input
            type="text"
            className="input input-bordered w-full"
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            disabled={saving}
          />
        );
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center gap-3 mb-4">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-10 h-10">
              <i className={`fas ${parameterInfo.icon}`}></i>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg">Update {parameterInfo.title}</h3>
            {parameterInfo.unit && (
              <p className="text-sm text-base-content/60">{parameterInfo.unit}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Current Value</span>
            </label>
            <div className="bg-base-200 p-3 rounded-lg">
              <span className="font-mono">
                {typeof currentValue === 'boolean'
                  ? (currentValue ? 'Enabled' : 'Disabled')
                  : currentValue
                }
                {parameterInfo.unit && ` ${parameterInfo.unit}`}
              </span>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">New Value</span>
            </label>
            {renderInput()}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Reason (Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              placeholder="Describe the reason for this change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              disabled={saving}
            />
          </div>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || value === currentValue}
          >
            {saving ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}