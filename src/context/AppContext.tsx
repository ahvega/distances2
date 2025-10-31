'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Vehicle, Parameter, ExchangeRates, Itinerary, AppOptions } from '@/types';
import {
  loadVehicles,
  loadParameters,
  loadExchangeRates,
  loadMyData,
  processParameters,
  processVehicles
} from '@/lib/dataLoader';

interface AppState {
  vehicles: Record<string, Vehicle>;
  parameters: Record<string, Parameter>;
  exchangeRates: ExchangeRates | null;
  itinerary: Itinerary;
  options: AppOptions;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VEHICLES'; payload: Record<string, Vehicle> }
  | { type: 'SET_PARAMETERS'; payload: Record<string, Parameter> }
  | { type: 'SET_EXCHANGE_RATES'; payload: ExchangeRates | null }
  | { type: 'UPDATE_ITINERARY'; payload: Partial<Itinerary> }
  | { type: 'UPDATE_OPTIONS'; payload: Partial<AppOptions> };

const initialItinerary: Itinerary = {
  vehiculos: [],
  dias: 1,
  incentivar: true,
  nacional: true,
  kms: { extra: 0, total: 0 },
  base: {
    lugar: 'San Pedro Sula, Honduras',
    code: '',
    origen: { duracion: 0, distancia: '' },
    destino: { duracion: 0, distancia: '' }
  },
  origen: {
    lugar: 'San Pedro Sula, Honduras',
    destino: { duracion: 0, distancia: '' }
  },
  destino: {
    lugar: 'Tela, Honduras',
    base: { duracion: 0, distancia: '' }
  },
  costo: {
    comun: 0,
    viaticos: { comida: 0, hotel: 0, incentivo: 0 },
    peaje: { salida: 0, sapTGU: 0, sapTLA: 0, ptzSAP: 0 },
    frontera: { autentica: 0, extra: 0 }
  },
  lastLocationUpdate: Date.now()
};

const initialOptions: AppOptions = {
  rndLps: 100,
  rndUSD: 5,
  compraUSD: 24.48,
  ventaUSD: 24.66,
  precioFuel: 150
};

const initialState: AppState = {
  vehicles: {},
  parameters: {},
  exchangeRates: null,
  itinerary: initialItinerary,
  options: initialOptions,
  loading: true,
  error: null
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_VEHICLES':
      return { ...state, vehicles: action.payload };
    case 'SET_PARAMETERS':
      return { ...state, parameters: action.payload };
    case 'SET_EXCHANGE_RATES':
      return { ...state, exchangeRates: action.payload };
    case 'UPDATE_ITINERARY':
      return {
        ...state,
        itinerary: { ...state.itinerary, ...action.payload }
      };
    case 'UPDATE_OPTIONS':
      return {
        ...state,
        options: { ...state.options, ...action.payload }
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    async function initializeData() {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        // Load all data concurrently
        const [vehicles, parameters, exchangeRates, myData] = await Promise.all([
          loadVehicles(),
          loadParameters(),
          loadExchangeRates(),
          loadMyData()
        ]);

        // Process and set vehicles
        const processedVehicles = processVehicles(vehicles);
        dispatch({ type: 'SET_VEHICLES', payload: processedVehicles });

        // Process and set parameters (combine regular parameters with myData)
        const allParameters = [...parameters, ...myData];
        const processedParameters = processParameters(allParameters);
        dispatch({ type: 'SET_PARAMETERS', payload: processedParameters });

        // Set exchange rates
        dispatch({ type: 'SET_EXCHANGE_RATES', payload: exchangeRates });

        // Update options with loaded parameters
        if (processedParameters.precio_diesel) {
          dispatch({
            type: 'UPDATE_OPTIONS',
            payload: {
              precioFuel: parseFloat(processedParameters.precio_diesel.valor),
              rndLps: parseFloat(processedParameters.redondeo_lps?.valor || '100'),
              rndUSD: parseFloat(processedParameters.redondeo_us?.valor || '5'),
              compraUSD: parseFloat(processedParameters.tasa_compra_us?.valor || '24.48'),
              ventaUSD: parseFloat(processedParameters.tasa_venta_us?.valor || '24.66')
            }
          });
        }

        // Update exchange rates if available
        if (exchangeRates) {
          dispatch({
            type: 'UPDATE_OPTIONS',
            payload: {
              compraUSD: exchangeRates.buyRateUSD,
              ventaUSD: exchangeRates.saleRateUSD
            }
          });
        }

      } catch (error) {
        console.error('Failed to initialize app data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load application data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    initializeData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}