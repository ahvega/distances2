'use client';

import React from 'react';
import type { PricingTableProps, PricingOption } from '@/types';

const ModernPricingTable = React.memo<PricingTableProps>(function ModernPricingTable({
  baseCost,
  markupOptions = [10, 15, 20, 25, 30],
  recommendedMarkup = 15,
  exchangeRate
}: PricingTableProps) {

  const formatCurrency = (amount: number, currency: 'USD' | 'HNL') => {
    const symbol = currency === 'USD' ? '$' : 'L.';
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculatePricingOptions = (): PricingOption[] => {
    return markupOptions.map(markup => {
      const salePrice = baseCost * (1 + markup / 100);
      const salePriceUSD = salePrice / exchangeRate;

      return {
        markup,
        cost: baseCost,
        salePrice,
        salePriceUSD,
        salePriceHNL: salePrice,
        recommended: markup === recommendedMarkup
      };
    });
  };

  const pricingOptions = calculatePricingOptions();

  return (
    <div className="space-y-6">
      {/* Cost Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-3 flex items-center">
          <i className="fas fa-calculator mr-2 text-primary"></i>
          Resumen de Costos Base
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{formatCurrency(baseCost, 'HNL')}</div>
            <div className="text-sm text-gray-600">Costo Total (HNL)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{formatCurrency(baseCost / exchangeRate, 'USD')}</div>
            <div className="text-sm text-gray-600">Costo Total (USD)</div>
          </div>
        </div>
        <div className="mt-3 text-center text-sm text-gray-500">
          Tipo de cambio: L. {exchangeRate.toFixed(2)} por USD
        </div>
      </div>

      {/* Pricing Options with Enhanced Visualization */}
      <div className="border border-primary-200 dark:border-primary-700 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center">
              <div className="p-2 bg-primary-500 rounded-lg mr-3">
                <i className="fas fa-tags"></i>
              </div>
              OPCIONES DE PRECIO
            </h3>
            <div className="text-sm text-primary-100">
              {markupOptions.length} opciones disponibles
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 bg-primary-50/30 dark:bg-primary-900/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {pricingOptions.map((option) => {
              const profit = option.salePrice - option.cost;
              const profitMargin = (profit / option.salePrice) * 100;

              return (
                <div
                  key={option.markup}
                  className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                    option.recommended
                      ? 'ring-2 ring-orange-400 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20'
                      : 'hover:ring-2 hover:ring-primary-300'
                  }`}
                >
                  {/* Recommended badge */}
                  {option.recommended && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      <i className="fas fa-star mr-1"></i>
                      RECOMENDADO
                    </div>
                  )}

                  {/* Markup percentage */}
                  <div className="text-center mb-4">
                    <div className={`text-4xl font-bold ${
                      option.recommended ? 'text-orange-600' : 'text-primary-600'
                    }`}>
                      {option.markup}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Margen de ganancia</div>
                  </div>

                  {/* Prices */}
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Precio HNL</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(option.salePriceHNL, 'HNL')}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Precio USD</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(option.salePriceUSD, 'USD')}
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide">Ganancia</div>
                      <div className="text-lg font-bold text-green-700 dark:text-green-300">
                        {formatCurrency(profit, 'HNL')}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {profitMargin.toFixed(1)}% del precio final
                      </div>
                    </div>
                  </div>

                  {/* Category badge */}
                  <div className="mt-4 text-center">
                    {option.markup <= 15 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        <i className="fas fa-thumbs-up mr-1"></i>
                        Competitivo
                      </span>
                    )}
                    {option.markup > 15 && option.markup <= 25 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                        <i className="fas fa-balance-scale mr-1"></i>
                        Estándar
                      </span>
                    )}
                    {option.markup > 25 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                        <i className="fas fa-crown mr-1"></i>
                        Premium
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison Table for Desktop */}
          <div className="hidden lg:block">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Comparación Detallada</h4>
            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Margen</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Precio (HNL)</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Precio (USD)</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ganancia</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {pricingOptions.map((option) => {
                    const profit = option.salePrice - option.cost;
                    const rowClass = option.recommended
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700';

                    return (
                      <tr key={option.markup} className={rowClass}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{option.markup}%</span>
                            {option.recommended && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                                <i className="fas fa-star mr-1"></i>
                                Recomendado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right font-bold text-lg text-gray-900 dark:text-gray-100">
                          {formatCurrency(option.salePriceHNL, 'HNL')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right font-bold text-lg text-gray-900 dark:text-gray-100">
                          {formatCurrency(option.salePriceUSD, 'USD')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(profit, 'HNL')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {option.markup <= 15 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              Competitivo
                            </span>
                          )}
                          {option.markup > 15 && option.markup <= 25 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                              Estándar
                            </span>
                          )}
                          {option.markup > 25 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                              Premium
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Option Highlight */}
      {pricingOptions.find(option => option.recommended) && (
        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-orange-800 dark:text-orange-200 flex items-center">
                <i className="fas fa-star mr-2"></i>
                Precio Recomendado ({recommendedMarkup}%)
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Este margen ofrece un equilibrio óptimo entre competitividad y rentabilidad
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {formatCurrency(baseCost * (1 + recommendedMarkup / 100), 'HNL')}
              </div>
              <div className="text-lg text-orange-600 dark:text-orange-400">
                {formatCurrency((baseCost * (1 + recommendedMarkup / 100)) / exchangeRate, 'USD')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Profit Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-6 border border-green-200 dark:border-green-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <i className="fas fa-arrow-down text-white text-xl"></i>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-800 dark:text-green-200">
                {Math.min(...markupOptions)}%
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Margen Mínimo</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700 dark:text-green-300">Precio HNL:</span>
              <span className="font-semibold text-green-800 dark:text-green-200">
                {formatCurrency(baseCost * (1 + Math.min(...markupOptions) / 100), 'HNL')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700 dark:text-green-300">Ganancia:</span>
              <span className="font-semibold text-green-800 dark:text-green-200">
                {formatCurrency(baseCost * (Math.min(...markupOptions) / 100), 'HNL')}
              </span>
            </div>
          </div>
          <div className="mt-4 text-xs text-green-600 dark:text-green-400">
            Opción más competitiva en el mercado
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 rounded-xl p-6 border border-orange-200 dark:border-orange-700 shadow-lg ring-2 ring-orange-300 dark:ring-orange-600">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <i className="fas fa-star text-white text-xl"></i>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-800 dark:text-orange-200">
                {recommendedMarkup}%
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Recomendado</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-700 dark:text-orange-300">Precio HNL:</span>
              <span className="font-semibold text-orange-800 dark:text-orange-200">
                {formatCurrency(baseCost * (1 + recommendedMarkup / 100), 'HNL')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-700 dark:text-orange-300">Ganancia:</span>
              <span className="font-semibold text-orange-800 dark:text-orange-200">
                {formatCurrency(baseCost * (recommendedMarkup / 100), 'HNL')}
              </span>
            </div>
          </div>
          <div className="mt-4 text-xs text-orange-600 dark:text-orange-400">
            Equilibrio óptimo entre competitividad y rentabilidad
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-6 border border-blue-200 dark:border-blue-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <i className="fas fa-arrow-up text-white text-xl"></i>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                {Math.max(...markupOptions)}%
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Margen Máximo</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700 dark:text-blue-300">Precio HNL:</span>
              <span className="font-semibold text-blue-800 dark:text-blue-200">
                {formatCurrency(baseCost * (1 + Math.max(...markupOptions) / 100), 'HNL')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700 dark:text-blue-300">Ganancia:</span>
              <span className="font-semibold text-blue-800 dark:text-blue-200">
                {formatCurrency(baseCost * (Math.max(...markupOptions) / 100), 'HNL')}
              </span>
            </div>
          </div>
          <div className="mt-4 text-xs text-blue-600 dark:text-blue-400">
            Máxima rentabilidad para servicios premium
          </div>
        </div>
      </div>
    </div>
  );
});

export default ModernPricingTable;