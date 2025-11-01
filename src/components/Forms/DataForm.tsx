'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quotationFormSchema, type QuotationFormData } from '@/utils/validation';
import { useAppContext } from '@/context/AppContext';
import { PlaceResult } from '@/hooks/useGooglePlaces';
import { Button, Input, Card, Badge, ComboBox } from '@/components/ui';
import { CardContent } from '@/components/ui/Card';
import LocationInput from './LocationInput';
import RangeSlider from './RangeSlider';
import VehicleSelection from './VehicleSelection';
import type { QuotationFormProps, Vehicle } from '@/types';

interface DataFormProps extends Partial<QuotationFormProps> {
  onSubmit?: (data: QuotationFormData) => void;
}

export default function DataForm({ onSubmit, loading: externalLoading }: DataFormProps) {
  const { state, dispatch } = useAppContext();
  const { vehicles, itinerary, loading: contextLoading } = state;
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);

  const loading = externalLoading || contextLoading;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: {
      origin: itinerary.origen.lugar || '',
      destination: itinerary.destino.lugar || '',
      baseLocation: itinerary.base.lugar || '',
      groupSize: 1,
      extraMileage: itinerary.kms.extra || 0
    }
  });

  const groupSize = watch('groupSize');
  const extraMileage = watch('extraMileage');

  // Filter vehicles based on group size
  const availableVehicles = React.useMemo(() => {
    return Object.values(vehicles).filter((vehicle: any) => {
      // Handle both legacy and modern vehicle interfaces
      const capacity = (vehicle as any).capacidad_real || (vehicle as Vehicle).passengerCapacity || 0;
      return capacity >= groupSize;
    });
  }, [vehicles, groupSize]);

  const handleVehicleSelect = React.useCallback((vehicles: Vehicle[] | Vehicle | null) => {
    const vehicleArray = vehicles === null ? [] : Array.isArray(vehicles) ? vehicles : [vehicles];
    setSelectedVehicles(vehicleArray);

    // Update legacy state for backward compatibility
    dispatch({
      type: 'UPDATE_ITINERARY',
      payload: { vehiculos: vehicleArray.map(v => v.id || (v as any).slug) }
    });
  }, [dispatch]);

  // Suggest vehicles automatically based on group size (greedy capacity fill)
  React.useEffect(() => {
    if (!groupSize || availableVehicles.length === 0) return;
    const byCapacity = [...availableVehicles].sort((a: any, b: any) => {
      const aCapacity = (a as any).capacidad_real || (a as Vehicle).passengerCapacity || 0;
      const bCapacity = (b as any).capacidad_real || (b as Vehicle).passengerCapacity || 0;
      return bCapacity - aCapacity;
    });
    const result: any[] = [];
    let remaining = groupSize;
    for (const v of byCapacity) {
      const cap = (v as any).capacidad_real || (v as Vehicle).passengerCapacity || 0;
      if (cap <= 0) continue;
      if (remaining > 0) {
        result.push(v);
        remaining -= cap;
        if (remaining <= 0) break;
      }
    }
    if (result.length > 0) {
      handleVehicleSelect(result);
    }
  }, [groupSize, availableVehicles]);

  const handleLocationChange = React.useCallback((field: 'origin' | 'destination' | 'baseLocation', value: string) => {
    setValue(field, value);

    // Update legacy state for backward compatibility
    const fieldMap = {
      origin: 'origen.lugar',
      destination: 'destino.lugar',
      baseLocation: 'base.lugar'
    };

    const legacyField = fieldMap[field];
    if (legacyField) {
      const [parent, child] = legacyField.split('.');
      const parentState = itinerary[parent as keyof typeof itinerary];
      if (typeof parentState === 'object' && parentState !== null) {
        dispatch({
          type: 'UPDATE_ITINERARY',
          payload: {
            [parent]: {
              ...parentState,
              [child]: value
            },
            // Update timestamp to trigger map recalculation
            lastLocationUpdate: Date.now()
          }
        });
      }
    }
  }, [setValue, dispatch, itinerary]);

  const handleLocationBlur = React.useCallback(() => {
    // Trigger map recalculation by updating a timestamp
    dispatch({
      type: 'UPDATE_ITINERARY',
      payload: {
        lastLocationUpdate: Date.now()
      }
    });
  }, [dispatch]);

  const handlePlaceSelect = React.useCallback((field: 'origin' | 'destination' | 'baseLocation', place: PlaceResult) => {
    // Use the formatted address from Google Places
    handleLocationChange(field, place.formattedAddress);
  }, [handleLocationChange]);

  const handleFormSubmit = (data: QuotationFormData) => {
    if (onSubmit) {
      onSubmit(data);
    }

    // Update legacy state
    dispatch({
      type: 'UPDATE_ITINERARY',
      payload: {
        origen: { ...itinerary.origen, lugar: data.origin },
        destino: { ...itinerary.destino, lugar: data.destination },
        base: { ...itinerary.base, lugar: data.baseLocation },
        kms: { ...itinerary.kms, extra: data.extraMileage || 0 }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <span className="text-slate-400 text-sm">Cargando datos...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Group Size Input */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
              <i className="fas fa-users text-blue-400"></i>
              <span>Tamaño del Grupo</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={50}
                placeholder="Número de pasajeros"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                {...register('groupSize', { valueAsNumber: true })}
              />
            </div>
            {errors.groupSize && (
              <p className="text-red-400 text-xs flex items-center space-x-1">
                <i className="fas fa-exclamation-circle"></i>
                <span>{errors.groupSize.message}</span>
              </p>
            )}
            <p className="text-slate-400 text-xs">Número de pasajeros que viajarán</p>
          </div>

          {/* Vehicle Selection with Capacity Filtering */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
              <i className="fas fa-truck text-emerald-400"></i>
              <span>Selección de Vehículo</span>
            </label>
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4">
              <ComboBox
                options={availableVehicles.map((v: any) => ({ value: v.id || v.slug, label: (v.nombre || `${v.make ?? ''} ${v.model ?? ''}`).trim() }))}
                value={selectedVehicles.map(v => (v.id || (v as any).slug))}
                onChange={(vals) => {
                  const vehiclesMap = new Map<string, any>();
                  for (const v of availableVehicles as any[]) {
                    vehiclesMap.set(v.id || v.slug, v);
                  }
                  const picked = vals.map(id => vehiclesMap.get(id)).filter(Boolean);
                  handleVehicleSelect(picked as any[]);
                }}
                placeholder="Selecciona vehículos (múltiple)"
              />
            </div>
            {availableVehicles.length === 0 && (groupSize || 0) > 0 && (
              <div className="flex items-center space-x-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <i className="fas fa-exclamation-triangle text-amber-400"></i>
                <span className="text-sm text-amber-200">
                  No hay vehículos disponibles para {groupSize || 0} pasajeros. Considera dividir el grupo.
                </span>
              </div>
            )}
          </div>

          {/* Location Inputs */}
          <div className="space-y-4">
            <h3 className="flex items-center space-x-2 text-sm font-medium text-slate-300">
              <i className="fas fa-map-marked-alt text-violet-400"></i>
              <span>Ubicaciones del Viaje</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-slate-400">
                  <i className="fas fa-flag text-blue-400"></i>
                  <span>Base</span>
                </label>
                <LocationInput
                  value={watch('baseLocation') || ''}
                  onChange={(value) => handleLocationChange('baseLocation', value)}
                  onBlur={handleLocationBlur}
                  onPlaceSelect={(place) => handlePlaceSelect('baseLocation', place)}
                  placeholder="Ubicación de la base"
                  icon="fa-map-pin"
                  enableAutocomplete={true}
                  showValidation={true}
                />
                {errors.baseLocation && (
                  <p className="text-red-400 text-xs flex items-center space-x-1">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{errors.baseLocation.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-slate-400">
                  <i className="fas fa-play-circle text-emerald-400"></i>
                  <span>Origen</span>
                </label>
                <LocationInput
                  value={watch('origin') || ''}
                  onChange={(value) => handleLocationChange('origin', value)}
                  onBlur={handleLocationBlur}
                  onPlaceSelect={(place) => handlePlaceSelect('origin', place)}
                  placeholder="Punto de origen"
                  icon="fa-play-circle"
                  enableAutocomplete={true}
                  showValidation={true}
                />
                {errors.origin && (
                  <p className="text-red-400 text-xs flex items-center space-x-1">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{errors.origin.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-slate-400">
                  <i className="fas fa-stop-circle text-rose-400"></i>
                  <span>Destino</span>
                </label>
                <LocationInput
                  value={watch('destination') || ''}
                  onChange={(value) => handleLocationChange('destination', value)}
                  onBlur={handleLocationBlur}
                  onPlaceSelect={(place) => handlePlaceSelect('destination', place)}
                  placeholder="Punto de destino"
                  icon="fa-stop-circle"
                  enableAutocomplete={true}
                  showValidation={true}
                />
                {errors.destination && (
                  <p className="text-red-400 text-xs flex items-center space-x-1">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{errors.destination.message}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Trip Configuration */}
          <div className="space-y-4">
            <h3 className="flex items-center space-x-2 text-sm font-medium text-slate-300">
              <i className="fas fa-cogs text-amber-400"></i>
              <span>Configuración del Viaje</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-slate-400">
                  <i className="fas fa-road text-cyan-400"></i>
                  <span>Kilómetros Extra</span>
                </label>
                <RangeSlider
                  min={0}
                  max={800}
                  step={5}
                  value={extraMileage || 0}
                  onChange={React.useCallback((value) => {
                    setValue('extraMileage', value);
                    dispatch({
                      type: 'UPDATE_ITINERARY',
                      payload: { kms: { ...itinerary.kms, extra: value } }
                    });
                  }, [setValue, dispatch, itinerary.kms])}
                  unit="kms"
                />
                {errors.extraMileage && (
                  <p className="text-red-400 text-xs flex items-center space-x-1">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{errors.extraMileage.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-slate-400">
                  <i className="fas fa-calendar-day text-indigo-400"></i>
                  <span>Días de Viaje</span>
                </label>
                <RangeSlider
                  min={1}
                  max={50}
                  step={1}
                  value={itinerary.dias}
                  onChange={React.useCallback((value) => dispatch({
                    type: 'UPDATE_ITINERARY',
                    payload: { dias: value }
                  }), [dispatch])}
                  unit="días"
                />
              </div>
            </div>
          </div>

          {/* Incentive Toggle */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
              <i className="fas fa-gift text-pink-400"></i>
              <span>Opciones Adicionales</span>
            </label>
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
                    <i className="fas fa-gift text-white text-xs"></i>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-200">Incentivo para el conductor</span>
                    <p className="text-xs text-slate-400">Incluir bonificación adicional</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={itinerary.incentivar}
                    onChange={React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => dispatch({
                      type: 'UPDATE_ITINERARY',
                      payload: { incentivar: e.target.checked }
                    }), [dispatch])}
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Validation Messages */}
          {selectedVehicles.length === 0 && (
            <div className="flex items-center space-x-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <i className="fas fa-exclamation-triangle text-amber-400"></i>
              <span className="text-sm text-amber-200">
                Debes seleccionar al menos un vehículo para continuar.
              </span>
            </div>
          )}

          {/* Submit Button */}
          {onSubmit && (
            <div className="pt-6 border-t border-slate-700/50">
              <button
                type="submit"
                disabled={isSubmitting || loading || selectedVehicles.length === 0}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting || loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-calculator"></i>
                    <span>Generar Cotización</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
  );
}
