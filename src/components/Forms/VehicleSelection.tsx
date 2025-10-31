'use client';

import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import type { Vehicle, VehicleSelectorProps } from '@/types';

// Legacy interface for backward compatibility
interface LegacyVehicleSelectionProps {
  vehicles: { [key: string]: any };
  selectedVehicles: string[];
  onVehicleChange: (slug: string, selected: boolean) => void;
}

// Combined props type
type VehicleSelectionProps = VehicleSelectorProps | LegacyVehicleSelectionProps;

function isLegacyProps(props: VehicleSelectionProps): props is LegacyVehicleSelectionProps {
  return 'selectedVehicles' in props && 'onVehicleChange' in props;
}

export default function VehicleSelection(props: VehicleSelectionProps) {
  // Handle legacy interface
  if (isLegacyProps(props)) {
    const { vehicles, selectedVehicles, onVehicleChange } = props;
    return (
      <div className="space-y-2 max-h-36 overflow-y-auto p-1">
        {Object.values(vehicles).map((vehicle: any) => (
          <Card key={vehicle.slug} variant="outlined" padding="sm" hover className="cursor-pointer">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                checked={selectedVehicles.includes(vehicle.slug)}
                onChange={(e) => onVehicleChange(vehicle.slug, e.target.checked)}
              />
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">{vehicle.nombre}</span>
            </label>
          </Card>
        ))}
      </div>
    );
  }

  // Handle new interface - now supporting multiple selection
  const { vehicles, groupSize, onVehicleSelect, selectedVehicle } = props;

  // Convert single selectedVehicle to array for backward compatibility
  const selectedVehicles = React.useMemo(() => {
    if (!selectedVehicle) return [];
    return Array.isArray(selectedVehicle) ? selectedVehicle : [selectedVehicle];
  }, [selectedVehicle]);

  const getVehicleCapacity = (vehicle: any): number => {
    // Handle both legacy and new vehicle formats
    return vehicle.capacidad_real || vehicle.passengerCapacity || 0;
  };

  const getVehicleName = (vehicle: any): string => {
    // Handle both legacy and new vehicle formats
    return vehicle.nombre || `${vehicle.make} ${vehicle.model}` || 'Unknown Vehicle';
  };

  const getVehicleId = (vehicle: any): string => {
    return vehicle.slug || vehicle.id || '';
  };

  const handleVehicleToggle = (vehicle: any) => {
    const vehicleId = getVehicleId(vehicle);
    const isCurrentlySelected = selectedVehicles.some(v => getVehicleId(v) === vehicleId);

    if (isCurrentlySelected) {
      // Remove vehicle from selection
      const newSelection = selectedVehicles.filter(v => getVehicleId(v) !== vehicleId);
      onVehicleSelect(newSelection.length > 0 ? newSelection : null);
    } else {
      // Add vehicle to selection
      const newSelection = [...selectedVehicles, vehicle];
      onVehicleSelect(newSelection);
    }
  };

  const getTotalCapacity = () => {
    return selectedVehicles.reduce((total, vehicle) => total + getVehicleCapacity(vehicle), 0);
  };

  const suggestMultipleVehicles = () => {
    if (vehicles.length === 0) return null;

    const totalSelectedCapacity = getTotalCapacity();
    const maxSingleCapacity = Math.max(...vehicles.map(getVehicleCapacity));

    if (groupSize > maxSingleCapacity) {
      const vehiclesNeeded = Math.ceil(groupSize / maxSingleCapacity);
      return (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800 mt-2">
          <i className="fas fa-info-circle text-blue-600 dark:text-blue-400"></i>
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Para {groupSize} pasajeros, se recomienda usar {vehiclesNeeded} vehículos
            (capacidad máxima: {maxSingleCapacity} por vehículo)
          </span>
        </div>
      );
    }

    if (selectedVehicles.length > 0) {
      const remaining = Math.max(0, groupSize - totalSelectedCapacity);
      const isComplete = remaining === 0;
      return (
        <div className={`flex items-center gap-2 p-3 rounded-lg mt-2 ${
          isComplete
            ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
            : 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
        }`}>
          <i className={`fas ${isComplete ? 'fa-check-circle text-green-600 dark:text-green-400' : 'fa-exclamation-triangle text-yellow-600 dark:text-yellow-400'}`}></i>
          <span className={`text-sm ${isComplete ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
            Capacidad total: {totalSelectedCapacity} pasajeros
            {remaining > 0 && ` (faltan ${remaining} espacios)`}
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 p-1">
        {vehicles.map((vehicle: any) => {
          const capacity = getVehicleCapacity(vehicle);
          const name = getVehicleName(vehicle);
          const id = getVehicleId(vehicle);
          const isSelected = selectedVehicles.some(v => getVehicleId(v) === id);
          const canAccommodate = capacity > 0; // Allow selection of any vehicle with capacity

          return (
            <Card
              key={id}
              variant="outlined"
              padding="none"
              hover={canAccommodate}
              className={`group transition-all duration-300 transform ${
                isSelected
                  ? 'border-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 dark:border-primary-500 dark:from-primary-900/30 dark:to-primary-800/20 shadow-lg scale-[1.02]'
                  : canAccommodate
                    ? 'hover:border-primary-300 hover:shadow-md hover:scale-[1.01] dark:hover:border-primary-600'
                    : 'opacity-50 cursor-not-allowed grayscale'
              }`}
              onClick={() => canAccommodate && handleVehicleToggle(vehicle)}
            >
              {/* Modern Header with selection indicator */}
              <div className={`p-4 border-b border-slate-600/50 transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30'
                  : 'bg-slate-700/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-blue-500 bg-slate-600 border-2 border-slate-500 rounded focus:ring-blue-500/20 focus:ring-2 transition-all"
                        checked={isSelected}
                        onChange={() => canAccommodate && handleVehicleToggle(vehicle)}
                        disabled={!canAccommodate}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <i className="fas fa-check text-white text-xs"></i>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg">
                        <i className="fas fa-car text-slate-300 text-sm"></i>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{name}</div>
                        <div className="hidden">
                          {vehicle.year && `${vehicle.year} • `}Capacidad: {capacity} pasajeros
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden">
                    {canAccommodate ? (
                      <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                        <i className="fas fa-check mr-1"></i>
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs text-red-600 dark:text-red-400">
                        <i className="fas fa-times mr-1"></i>
                        Sin capacidad
                      </span>
                    )}
                    {false && isSelected && (
                      <span className="inline-flex items-center text-xs text-blue-500">
                        <i className="fas fa-star mr-1"></i>
                        Seleccionado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle specs in single column */}
              <div className="p-4">
                <div className="space-y-4">
                  {/* Capacity row */}
                  <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Capacidad</span>
                    <span className="font-medium">{capacity} pasajeros</span>
                  </div>
                  {/* Performance metrics */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300 flex items-center">
                      <i className="fas fa-tachometer-alt mr-2 text-cyan-400"></i>
                      Rendimiento
                    </h4>
                    {(vehicle.fuelEfficiency || vehicle.rendimiento) && (
                      <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Combustible:</span>
                          <span className="text-sm font-medium text-cyan-300">
                            {vehicle.fuelEfficiency || vehicle.rendimiento} {vehicle.fuelEfficiencyUnit || 'km/gal'}
                          </span>
                        </div>
                        {vehicle.fuelCapacity && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">Tanque:</span>
                            <span className="text-sm font-medium text-cyan-300">
                              {vehicle.fuelCapacity} gal
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cost information */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300 flex items-center">
                      <i className="fas fa-dollar-sign mr-2 text-emerald-400"></i>
                      Costos
                    </h4>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg space-y-2">
                      {(vehicle.costPerDay || vehicle.costo_por_dia) && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Por día:</span>
                          <span className="text-sm font-medium text-emerald-300">
                            L. {Number(vehicle.costPerDay || vehicle.costo_por_dia || 0).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {(vehicle.costPerDistance || vehicle.costo_por_km) && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Por km:</span>
                          <span className="text-sm font-medium text-emerald-300">
                            L. {Number(vehicle.costPerDistance || vehicle.costo_por_km || 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Capacity visualization (removed per new layout) */}
                <div className="hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Capacidad de pasajeros
                    </span>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {capacity}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(capacity, 12) }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < Math.min(groupSize, capacity)
                            ? 'bg-primary-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                    {capacity > 12 && (
                      <span className="text-xs text-gray-500 ml-2">+{capacity - 12} más</span>
                    )}
                  </div>
                  {groupSize > capacity && (
                    <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      Excede capacidad por {groupSize - capacity} pasajeros
                    </div>
                  )}
                </div>

                {/* Action button for better UX */}
                {false && canAccommodate && (
                  <div className="mt-4">
                    <Button
                      variant={isSelected ? "success" : "outline"}
                      size="sm"
                      fullWidth
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleVehicleToggle(vehicle);
                      }}
                      className="transition-all duration-200"
                    >
                      {isSelected ? (
                        <>
                          <i className="fas fa-check mr-2"></i>
                          Seleccionado
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus mr-2"></i>
                          Seleccionar vehículo
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {vehicles.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
          <i className="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400"></i>
          <span className="text-sm text-yellow-800 dark:text-yellow-200">No hay vehículos disponibles</span>
        </div>
      )}

      {suggestMultipleVehicles()}
    </div>
  );
}


