'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { costCalculationService } from '@/services/CostCalculationService';
import { vehicleManagementService } from '@/services/VehicleManagementService';
import type { DetailedCosts, Vehicle, RouteResult } from '@/types';

function toModernVehicle(candidate: any): Vehicle | null {
  if (!candidate) return null;
  // If already in modern shape
  if (
    candidate &&
    typeof candidate.make === 'string' &&
    typeof candidate.model === 'string' &&
    typeof candidate.fuelCapacity === 'number'
  ) {
    return candidate as Vehicle;
  }

  // Legacy → Modern mapping fallback
  try {
    const v = candidate as any;
    const veh: Vehicle = {
      id: String(v.id ?? v.slug ?? 'unknown'),
      make: 'Toyota',
      model: String((v.nombre ?? `${v.make ?? ''} ${v.model ?? ''}`) || 'Vehículo'),
      year: 2020,
      passengerCapacity: Number(v.capacidad_real ?? v.passengerCapacity ?? 0),
      fuelCapacity: Number(v.galones_tanque ?? v.fuelCapacity ?? 0),
      fuelEfficiency: Number(v.rendimiento ?? v.fuelEfficiency ?? 0),
      fuelEfficiencyUnit: (v.fuelEfficiencyUnit ?? 'kpg') as Vehicle['fuelEfficiencyUnit'],
      costPerDistance: Number(v.costo_por_km ?? v.costPerDistance ?? 0),
      costPerDay: Number(v.costo_por_dia ?? v.costPerDay ?? 0),
      distanceUnit: (v.distanceUnit ?? 'km') as Vehicle['distanceUnit'],
    };
    return veh;
  } catch {
    return null;
  }
}

export function useQuotation() {
  const { state } = useAppContext();
  const { itinerary, vehicles, options } = state;

  const [costs, setCosts] = useState<DetailedCosts | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedId = itinerary.vehiculos[0];

  const routeTotals = useMemo(() => {
    const totalDistance = Number(itinerary.kms.total || 0);
    const totalTime = Number(
      (itinerary.base.origen?.duracion || 0) +
      (itinerary.origen.destino?.duracion || 0) +
      (itinerary.destino.base?.duracion || 0)
    );
    return { totalDistance, totalTime };
  }, [itinerary]);

  useEffect(() => {
    const compute = async () => {
      setError(null);
      setCosts(null);

      if (!selectedId || routeTotals.totalDistance <= 0) return;

      setLoading(true);
      try {
        // Try modern vehicles first
        const modernList = vehicleManagementService.getVehicles();
        let modern = modernList.find(v => v.id === String(selectedId)) || null;

        // Fallback to convert the one from context
        if (!modern) {
          const legacy = (vehicles as any)[selectedId];
          modern = toModernVehicle(legacy);
        }

        if (!modern) {
          throw new Error('No se pudo determinar el vehículo seleccionado');
        }

        setVehicle(modern);

        // Build minimal RouteResult needed by the service
        const route: RouteResult = {
          totalDistance: routeTotals.totalDistance,
          totalTime: routeTotals.totalTime,
          route: {} as any,
          segments: []
        };

        const detailed = await costCalculationService.calculateTotalCosts({
          route,
          vehicle: modern,
          groupSize: 1,
          extraMileage: 0
        });

        setCosts(detailed);
      } catch (e: any) {
        setError(e?.message || 'Error calculando costos');
      } finally {
        setLoading(false);
      }
    };

    compute();
  }, [selectedId, routeTotals, vehicles]);

  return {
    loading,
    error,
    costs,
    vehicle,
    exchangeRate: options.ventaUSD,
    baseCost: costs?.total ?? null,
  };
}
