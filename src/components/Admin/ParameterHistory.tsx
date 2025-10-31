'use client';

import React, { useState, useEffect } from 'react';
import { parameterManagementService } from '@/services/ParameterManagementService';

interface ParameterChangeHistory {
  parameterKey: string;
  oldValue: number;
  newValue: number;
  timestamp: number;
  reason?: string;
}

interface ParameterHistoryProps {
  parameterKey?: string;
  limit?: number;
}

export default function ParameterHistory({ parameterKey, limit = 50 }: ParameterHistoryProps) {
  const [history, setHistory] = useState<ParameterChangeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState<string>(parameterKey || 'all');

  useEffect(() => {
    loadHistory();
  }, [selectedParameter]);

  const loadHistory = () => {
    try {
      setLoading(true);
      const historyData = parameterManagementService.getChangeHistory(
        selectedParameter === 'all' ? undefined : selectedParameter,
        limit
      );
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load parameter history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatParameterName = (key: string): string => {
    const nameMap: Record<string, string> = {
      fuelPrice: 'Fuel Price',
      mealCostPerDay: 'Meal Cost per Day',
      hotelCostPerNight: 'Hotel Cost per Night',
      exchangeRate: 'Exchange Rate',
      useCustomExchangeRate: 'Custom Exchange Rate',
      preferredDistanceUnit: 'Distance Unit',
      preferredCurrency: 'Currency',
      system: 'System'
    };
    return nameMap[key] || key;
  };

  const formatValue = (key: string, value: number): string => {
    if (key === 'useCustomExchangeRate') {
      return value ? 'Enabled' : 'Disabled';
    }
    if (key === 'preferredDistanceUnit') {
      return value === 1 ? 'Miles' : 'Kilometers';
    }
    if (key === 'preferredCurrency') {
      return value === 1 ? 'USD' : 'HNL';
    }
    if (key === 'system') {
      return 'System Operation';
    }
    return value.toFixed(2);
  };

  const getParameterIcon = (key: string): string => {
    const iconMap: Record<string, string> = {
      fuelPrice: 'fa-gas-pump',
      mealCostPerDay: 'fa-utensils',
      hotelCostPerNight: 'fa-bed',
      exchangeRate: 'fa-exchange-alt',
      useCustomExchangeRate: 'fa-toggle-on',
      preferredDistanceUnit: 'fa-ruler',
      preferredCurrency: 'fa-money-bill',
      system: 'fa-cog'
    };
    return iconMap[key] || 'fa-edit';
  };

  const handleClearHistory = () => {
    if (!confirm('Are you sure you want to clear all parameter change history? This action cannot be undone.')) {
      return;
    }

    try {
      parameterManagementService.clearChangeHistory();
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('Failed to clear history. Please try again.');
    }
  };

  const uniqueParameters = Array.from(new Set(history.map(h => h.parameterKey)));

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-center p-4">
            <div className="loading loading-spinner loading-md"></div>
            <span className="ml-4">Loading parameter history...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title">
            <i className="fas fa-history"></i>
            Parameter Change History
          </h3>
          <div className="flex gap-2">
            <select
              className="select select-bordered select-sm"
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
            >
              <option value="all">All Parameters</option>
              {uniqueParameters.map(param => (
                <option key={param} value={param}>
                  {formatParameterName(param)}
                </option>
              ))}
            </select>
            <button
              onClick={handleClearHistory}
              className="btn btn-outline btn-error btn-sm"
              disabled={history.length === 0}
            >
              <i className="fas fa-trash"></i>
              Clear History
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">
            <i className="fas fa-history text-4xl mb-4 opacity-30"></i>
            <p>No parameter changes recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Old Value</th>
                  <th>New Value</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {history.map((change, index) => (
                  <tr key={index}>
                    <td>
                      <div className="flex items-center gap-2">
                        <i className={`fas ${getParameterIcon(change.parameterKey)} text-primary`}></i>
                        <span className="font-medium">
                          {formatParameterName(change.parameterKey)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline">
                        {formatValue(change.parameterKey, change.oldValue)}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {formatValue(change.parameterKey, change.newValue)}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div>{new Date(change.timestamp).toLocaleDateString()}</div>
                        <div className="text-base-content/60">
                          {new Date(change.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="max-w-xs">
                        {change.reason ? (
                          <span className="text-sm">{change.reason}</span>
                        ) : (
                          <span className="text-base-content/40 italic">No reason provided</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {history.length > 0 && (
          <div className="text-center text-sm text-base-content/60 mt-4">
            Showing {history.length} most recent changes
            {selectedParameter !== 'all' && ` for ${formatParameterName(selectedParameter)}`}
          </div>
        )}
      </div>
    </div>
  );
}