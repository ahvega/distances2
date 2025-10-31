'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { VehicleCalculator, formatUnits } from '@/lib/costCalculation';
import type { CostBreakdownProps, DetailedCosts, Vehicle } from '@/types';

interface CostsDisplayProps extends Partial<CostBreakdownProps> {
  costs?: DetailedCosts;
  vehicle?: Vehicle;
  currency?: 'USD' | 'HNL';
}

export default function CostsDisplay({ costs: propCosts, vehicle: propVehicle, currency = 'HNL' }: CostsDisplayProps) {
  const { state } = useAppContext();
  const { vehicles, itinerary, options, parameters, loading } = state;
  const [calculations, setCalculations] = useState<any[]>([]);

  useEffect(() => {
    // If costs are provided as props, use them directly
    if (propCosts && propVehicle) {
      return;
    }

    // Otherwise, use legacy calculation system
    if (itinerary.vehiculos.length > 0 && itinerary.kms.total > 0) {
      const newCalculations = itinerary.vehiculos.map(vehicleSlug => {
        const vehicle = vehicles[vehicleSlug];
        if (vehicle) {
          const calculator = new VehicleCalculator(vehicle as any);
          calculator.calcCostos(itinerary, options);
          return calculator.getCosts();
        }
        return null;
      }).filter(Boolean);

      setCalculations(newCalculations);
    } else {
      setCalculations([]);
    }
  }, [vehicles, itinerary, options, propCosts, propVehicle]);

  // If modern costs are provided, use the new component
  if (propCosts && propVehicle) {
    const ModernCostBreakdown = React.lazy(() => import('./ModernCostBreakdown'));
    return (
      <React.Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="spinner"></div>
          <span className="ml-2">Cargando desglose de costos...</span>
        </div>
      }>
        <ModernCostBreakdown costs={propCosts} vehicle={propVehicle} currency={currency} />
      </React.Suspense>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="spinner"></div>
        <span className="ml-2">Calculando costos...</span>
      </div>
    );
  }

  if (itinerary.vehiculos.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="fas fa-info-circle"></i>
        <span>Selecciona un vehículo para ver los costos</span>
      </div>
    );
  }

  if (itinerary.kms.total === 0) {
    return (
      <div className="alert alert-warning">
        <i className="fas fa-route"></i>
        <span>Calcula la ruta para generar los costos</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {calculations.map((calc, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <div className="bg-plannertours-blue text-white p-3">
            <h3 className="font-bold">Detalle de Costos {calc.modelo.toUpperCase()}</h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Fuel Costs */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">COMBUSTIBLE:</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Total Distancia Itinerario</span>
                  <span>{formatUnits(itinerary.kms.total, 'Kms')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rendimiento {calc.modelo}</span>
                  <span>{formatUnits(calc.kmsGal, 'Km/Gal')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Combustible Total Necesario</span>
                  <span>{formatUnits(Math.round(calc.galsItinerario || 0), 'Gals')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capacidad del Tanque {calc.modelo}</span>
                  <span>{formatUnits(calc.galsTanque, 'Gals', 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Autonomía {calc.modelo}</span>
                  <span>{formatUnits(calc.autonomia, 'Kms')}</span>
                </div>

                {(calc.galsItinerario || 0) - calc.galsTanque >= 0 ? (
                  <>
                    <div className="flex justify-between">
                      <span>Galones Extra Necesarios</span>
                      <span>{formatUnits(Math.round((calc.galsItinerario || 0) - calc.galsTanque), 'Gals')}</span>
                    </div>
                    <div className="flex justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      <span>Anticipo para Combustible</span>
                      <span>{formatUnits(Math.round((calc.galsItinerario || 0) - calc.galsTanque) * options.precioFuel, 'L')}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-green-600">No necesita combustible extra</div>
                )}

                <div className="flex justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded font-semibold">
                  <span>Total Combustible</span>
                  <span>{formatUnits(calc.cFuelItinerario || 0, 'L')}</span>
                </div>
              </div>
            </div>

            {/* Incentive */}
            {itinerary.incentivar && (
              <div className="space-y-2">
                <div className="flex justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <span>Incentivo Chofer (opcional)</span>
                  <span>{formatUnits((Number(parameters.incentivo_hn?.valor) || 0) * itinerary.dias, 'L')}</span>
                </div>
              </div>
            )}

            {/* Travel Expenses */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">VIÁTICOS:</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>
                    Alimentación {itinerary.nacional ? 'HN' : 'CA'}, {itinerary.dias} día{itinerary.dias > 1 ? 's' : ''}
                  </span>
                  <span>
                    {formatUnits(
                      (itinerary.nacional ?
                        (Number(parameters.alimentacion_hn?.valor) || 0) :
                        (Number(parameters.alimentacion_ca?.valor) || 0) * options.ventaUSD
                      ) * 3 * itinerary.dias,
                      'L'
                    )}
                  </span>
                </div>

                {itinerary.dias > 1 && (
                  <div className="flex justify-between">
                    <span>
                      Hotel {itinerary.nacional ? 'HN' : 'CA'}, {itinerary.dias - 1} noche{itinerary.dias >= 3 ? 's' : ''}
                    </span>
                    <span>
                      {formatUnits(
                        (itinerary.nacional ?
                          (Number(parameters.hotel_hn_1?.valor) || 0) :
                          (Number(parameters.hotel_ca?.valor) || 0) * options.ventaUSD
                        ) * (itinerary.dias - 1),
                        'L'
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded font-semibold">
                  <span>Total Viáticos</span>
                  <span>
                    {formatUnits(
                      ((itinerary.nacional ?
                        (Number(parameters.alimentacion_hn?.valor) || 0) :
                        (Number(parameters.alimentacion_ca?.valor) || 0) * options.ventaUSD
                      ) * 3 * itinerary.dias) +
                      ((itinerary.nacional ?
                        (Number(parameters.hotel_hn_1?.valor) || 0) :
                        (Number(parameters.hotel_ca?.valor) || 0) * options.ventaUSD
                      ) * (itinerary.dias - 1)),
                      'L'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Tolls */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">PEAJES:</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Peaje Salida SPS</span>
                  <span>{formatUnits(Number(parameters.peaje_salida_sap?.valor) || 0, 'L')}</span>
                </div>
                <div className="flex justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded font-semibold">
                  <span>Total Peajes</span>
                  <span>{formatUnits(Number(parameters.peaje_salida_sap?.valor) || 0, 'L')}</span>
                </div>
              </div>
            </div>

            {/* Border Expenses (for international trips) */}
            {!itinerary.nacional && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">GASTOS FRONTERA:</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Auténtica</span>
                    <span>{formatUnits(Number(parameters.autentica?.valor) || 0, 'L')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Anticipo Otros Gastos</span>
                    <span>{formatUnits((Number(parameters.gastos_frontera?.valor) || 0) * options.ventaUSD, 'L')}</span>
                  </div>
                  <div className="flex justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded font-semibold">
                    <span>Total Gastos Frontera</span>
                    <span>
                      {formatUnits(
                        (Number(parameters.autentica?.valor) || 0) +
                        ((Number(parameters.gastos_frontera?.valor) || 0) * options.ventaUSD),
                        'L'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Final Totals */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between bg-plannertours-blue text-white p-2 rounded font-bold">
                <span>Total Costos {calc.modelo}</span>
                <span>{formatUnits(calc.cItinerarioLps || 0, 'L')}</span>
              </div>

              <div className="flex justify-between">
                <span>(+) Costo Fijo - {formatUnits(calc.costoDia, 'L/día')} x {itinerary.dias} día{itinerary.dias > 1 ? 's' : ''}</span>
                <span>{formatUnits(calc.cDiaItinerario || 0, 'L')}</span>
              </div>

              <div className="flex justify-between">
                <span>(+) Costo Variable - {formatUnits((calc.cItinerarioLps || 0) / itinerary.kms.total, 'L/Km', 3)} x {itinerary.kms.total} Kms</span>
                <span>{formatUnits((calc.cItinerarioLps || 0) - (calc.cFuelItinerario || 0) - (calc.cDiaItinerario || 0), 'L')}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}