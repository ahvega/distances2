'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { VehicleCalculator, formatUnits } from '@/lib/costCalculation';
import type { PricingTableProps } from '@/types';

interface PricingDisplayProps extends Partial<PricingTableProps> {
  baseCost?: number;
  markupOptions?: number[];
  recommendedMarkup?: number;
  exchangeRate?: number;
  showLegacyView?: boolean;
}

export default function PricingDisplay({
  baseCost: propBaseCost,
  markupOptions = [10, 15, 20, 25, 30],
  recommendedMarkup = 15,
  exchangeRate: propExchangeRate,
  showLegacyView = false
}: PricingDisplayProps) {
  const { state } = useAppContext();
  const { vehicles, itinerary, options, loading } = state;
  const [calculations, setCalculations] = useState<any[]>([]);

  useEffect(() => {
    // If modern props are provided, skip legacy calculations
    if (propBaseCost && propExchangeRate) {
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
  }, [vehicles, itinerary, options, propBaseCost, propExchangeRate]);

  // If modern pricing props are provided, use the new component
  if (propBaseCost && propExchangeRate && !showLegacyView) {
    const ModernPricingTable = React.lazy(() => import('./ModernPricingTable'));
    return (
      <React.Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="spinner"></div>
          <span className="ml-2">Cargando tabla de precios...</span>
        </div>
      }>
        <ModernPricingTable
          baseCost={propBaseCost}
          markupOptions={markupOptions}
          recommendedMarkup={recommendedMarkup}
          exchangeRate={propExchangeRate}
        />
      </React.Suspense>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="spinner"></div>
        <span className="ml-2">Calculando precios...</span>
      </div>
    );
  }

  if (itinerary.vehiculos.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="fas fa-info-circle"></i>
        <span>Selecciona un vehículo para ver la cotización</span>
      </div>
    );
  }

  if (itinerary.kms.total === 0) {
    return (
      <div className="alert alert-warning">
        <i className="fas fa-route"></i>
        <span>Calcula la ruta para generar la cotización</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Route Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Resumen del Itinerario</h3>
        <div className="text-sm space-y-1">
          <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Base</span><span className="text-right">{itinerary.base.lugar}</span></div>
          <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Origen</span><span className="text-right">{itinerary.origen.lugar}</span></div>
          <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Destino</span><span className="text-right">{itinerary.destino.lugar}</span></div>
          <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Días</span><span className="text-right">{itinerary.dias}</span></div>
          <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Total Kms</span><span className="text-right">{formatUnits(itinerary.kms.total, 'Kms')}</span></div>
          <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Tipo</span><span className="text-right">{itinerary.nacional ? 'Nacional' : 'Internacional'}</span></div>
        </div>
      </div>

      {/* Pricing Tables */}
      {calculations.map((calc, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <div className="bg-plannertours-blue text-white p-3">
            <h3 className="font-bold">Costo {calc.modelo}</h3>
          </div>

          <div className="p-4">
            {/* Cost Summary */}
            <div className="price-row shade-header">
              <span>Concepto</span>
              <span>Lempiras</span>
              <span>Dólares</span>
              {itinerary.dias > 1 && <span>Por Día</span>}
            </div>

            <div className="price-row">
              <span className="font-semibold">Costo {calc.modelo}</span>
              <span>{formatUnits(calc.cItinerarioLps || 0, 'L')}</span>
              <span>{formatUnits(calc.cItinerarioUSD || 0, '$')}</span>
              {itinerary.dias > 1 && (
                <span>{formatUnits((calc.cItinerarioUSD || 0) / itinerary.dias, '$')}/día</span>
              )}
            </div>

            {/* Pricing Tiers */}
            <div className="mt-4 space-y-1">
              {[30, 25, 20, 15, 10].map(margin => {
                const lpsKey = `precioAl${margin}` as keyof typeof calc;
                const usdKey = `precioAl${margin}D` as keyof typeof calc;
                const lpsPrice = calc[lpsKey] as number;
                const usdPrice = calc[usdKey] as number;

                const bgClass = margin === 25 ? 'bg-blue-100 dark:bg-blue-900' :
                              margin === 15 ? 'bg-orange-100 dark:bg-orange-900' :
                              margin === 10 ? 'border-b border-plannertours-dark' : '';

                return (
                  <div key={margin} className={`price-row ${bgClass}`}>
                    <span>Precio al {margin}%</span>
                    <span className="font-bold">{formatUnits(lpsPrice, 'L')}</span>
                    <span className="font-bold">{formatUnits(usdPrice, '$')}</span>
                    {itinerary.dias > 1 && (
                      <span className="font-bold">
                        {formatUnits(usdPrice / itinerary.dias, '$')}/día
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
