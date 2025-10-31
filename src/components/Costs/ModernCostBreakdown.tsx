'use client';

import React from 'react';
import type { CostBreakdownProps, DetailedCosts, Vehicle } from '@/types';
import { formatUnits } from '@/lib/costCalculation';

const ModernCostBreakdown = React.memo<CostBreakdownProps>(function ModernCostBreakdown({ costs, vehicle, currency = 'HNL' }) {
  const formatCurrency = (amount: number) => {
    const symbol = currency === 'USD' ? '$' : 'L.';
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDistance = (distance: number) => {
    return `${distance.toLocaleString('en-US', { maximumFractionDigits: 1 })} km`;
  };

  const formatFuelVolume = (volume: number) => {
    return `${volume.toLocaleString('en-US', { maximumFractionDigits: 1 })} gal`;
  };

  const getCostPercentage = (cost: number) => {
    return ((cost / costs.total) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Information */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800 dark:text-gray-200">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-3">
            <i className="fas fa-truck text-primary-600 dark:text-primary-400"></i>
          </div>
          Información del Vehículo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Modelo:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{vehicle.make} {vehicle.model}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Año:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{vehicle.year || 'N/A'}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Capacidad:</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">{vehicle.passengerCapacity} pasajeros</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tanque:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{formatFuelVolume(vehicle.fuelCapacity)}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rendimiento:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{vehicle.fuelEfficiency} {vehicle.fuelEfficiencyUnit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fuel Costs */}
      <div className="border border-blue-200 dark:border-blue-700 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg mr-3">
                <i className="fas fa-gas-pump"></i>
              </div>
              COMBUSTIBLE
            </h3>
            <div className="text-right">
              <div className="text-sm opacity-90">Porcentaje del total</div>
              <div className="text-xl font-bold">{getCostPercentage(costs.fuel.cost)}%</div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i className="fas fa-tint mr-2 text-blue-500"></i>
                    Consumo Total:
                  </span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">{formatFuelVolume(costs.fuel.consumption)}</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i className="fas fa-dollar-sign mr-2 text-green-500"></i>
                    Precio por Galón:
                  </span>
                  <span className="font-bold text-green-700 dark:text-green-300">{formatCurrency(costs.fuel.pricePerUnit)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/20 p-6 rounded-xl text-center border-2 border-blue-300 dark:border-blue-600">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Total Combustible</div>
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">{formatCurrency(costs.fuel.cost)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refueling Costs (if applicable) */}
      {costs.refueling.stops > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-orange-600 text-white p-3">
            <h3 className="font-bold flex items-center">
              <i className="fas fa-route mr-2"></i>
              REABASTECIMIENTO EN RUTA
            </h3>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Paradas Necesarias:</span>
                <span className="font-medium">{costs.refueling.stops}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo por Parada:</span>
                <span className="font-medium">{formatCurrency(costs.refueling.costPerStop)}</span>
              </div>
            </div>

            <div className="flex justify-between bg-orange-50 dark:bg-orange-900/20 p-3 rounded font-semibold">
              <span>Total Reabastecimiento:</span>
              <span>{formatCurrency(costs.refueling.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Driver Expenses */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-green-600 text-white p-3">
          <h3 className="font-bold flex items-center">
            <i className="fas fa-utensils mr-2"></i>
            GASTOS DEL CONDUCTOR
          </h3>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Alimentación ({costs.driver.days} días):</span>
              <span className="font-medium">{formatCurrency(costs.driver.meals)}</span>
            </div>
            {costs.driver.lodging > 0 && (
              <div className="flex justify-between">
                <span>Hospedaje ({costs.driver.days - 1} noches):</span>
                <span className="font-medium">{formatCurrency(costs.driver.lodging)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded font-semibold">
            <span>Total Gastos Conductor:</span>
            <span>{formatCurrency(costs.driver.total)}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Operational Costs */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-purple-600 text-white p-3">
          <h3 className="font-bold flex items-center">
            <i className="fas fa-cogs mr-2"></i>
            COSTOS OPERACIONALES
          </h3>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Costo por Distancia:</span>
              <span className="font-medium">{formatCurrency(costs.vehicle.distanceCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo por Día:</span>
              <span className="font-medium">{formatCurrency(costs.vehicle.dailyCost)}</span>
            </div>
          </div>

          <div className="flex justify-between bg-purple-50 dark:bg-purple-900/20 p-3 rounded font-semibold">
            <span>Total Operacional:</span>
            <span>{formatCurrency(costs.vehicle.total)}</span>
          </div>
        </div>
      </div>

      {/* Total Summary with Visual Breakdown */}
      <div className="border-2 border-primary-300 dark:border-primary-600 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl flex items-center">
                <div className="p-3 bg-primary-500 rounded-lg mr-3">
                  <i className="fas fa-calculator"></i>
                </div>
                RESUMEN TOTAL
              </h3>
              <p className="text-primary-100 mt-1">Desglose completo de costos</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{formatCurrency(costs.total)}</div>
              <div className="text-primary-200 text-sm">Costo total del viaje</div>
            </div>
          </div>
        </div>

        {/* Visual cost breakdown */}
        <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10">
          {/* Cost distribution chart */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Distribución de Costos</h4>
            <div className="flex rounded-lg overflow-hidden h-4 bg-gray-200 dark:bg-gray-700">
              <div
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${getCostPercentage(costs.fuel.cost)}%` }}
                title={`Combustible: ${getCostPercentage(costs.fuel.cost)}%`}
              ></div>
              {costs.refueling.total > 0 && (
                <div
                  className="bg-orange-500 transition-all duration-500"
                  style={{ width: `${getCostPercentage(costs.refueling.total)}%` }}
                  title={`Reabastecimiento: ${getCostPercentage(costs.refueling.total)}%`}
                ></div>
              )}
              <div
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${getCostPercentage(costs.driver.total)}%` }}
                title={`Conductor: ${getCostPercentage(costs.driver.total)}%`}
              ></div>
              <div
                className="bg-purple-500 transition-all duration-500"
                style={{ width: `${getCostPercentage(costs.vehicle.total)}%` }}
                title={`Operacional: ${getCostPercentage(costs.vehicle.total)}%`}
              ></div>
            </div>
          </div>

          {/* Cost breakdown cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Combustible</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(costs.fuel.cost)}</div>
                  <div className="text-xs text-gray-500">{getCostPercentage(costs.fuel.cost)}% del total</div>
                </div>
                <i className="fas fa-gas-pump text-blue-500 text-xl"></i>
              </div>
            </div>

            {costs.refueling.total > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">Reabastecimiento</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(costs.refueling.total)}</div>
                    <div className="text-xs text-gray-500">{getCostPercentage(costs.refueling.total)}% del total</div>
                  </div>
                  <i className="fas fa-route text-orange-500 text-xl"></i>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Conductor</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(costs.driver.total)}</div>
                  <div className="text-xs text-gray-500">{getCostPercentage(costs.driver.total)}% del total</div>
                </div>
                <i className="fas fa-user text-green-500 text-xl"></i>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Operacional</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(costs.vehicle.total)}</div>
                  <div className="text-xs text-gray-500">{getCostPercentage(costs.vehicle.total)}% del total</div>
                </div>
                <i className="fas fa-cogs text-purple-500 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>    </div>
  );
});

export default ModernCostBreakdown;