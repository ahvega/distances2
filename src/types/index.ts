// Core application types

// Vehicle Model - Enhanced for new requirements
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  passengerCapacity: number;
  fuelCapacity: number;
  fuelEfficiency: number;
  fuelEfficiencyUnit: 'mpg' | 'mpl' | 'kpl' | 'kpg';
  costPerDistance: number;
  costPerDay: number;
  distanceUnit: 'km' | 'mile';
}

// Legacy Vehicle interface for backward compatibility
export interface LegacyVehicle {
  id: number;
  nombre: string;
  rendimiento: number;
  costo_por_dia: string;
  costo_por_km: string;
  capacidad_nominal: number;
  capacidad_real: number;
  galones_tanque: string;
  slug: string;
  creado: string;
  actualizado: string;
}

// System Parameters Model - Enhanced for new requirements
export interface SystemParameters {
  fuelPrice: number;
  mealCostPerDay: number;
  hotelCostPerNight: number;
  exchangeRate: number;
  useCustomExchangeRate: boolean;
  preferredDistanceUnit: 'km' | 'mile';
  preferredCurrency: 'USD' | 'HNL';
}

// Legacy Parameter interface for backward compatibility
export interface Parameter {
  id: number;
  annio: number;
  nombre: string;
  valor: string;
  unidad: string;
  orden: number;
  slug: string;
  creado: string;
  actualizado: string;
}

export interface ExchangeRates {
  country: string;
  buyRateUSD: number;
  saleRateUSD: number;
  buyRateEUR: number;
  saleRateEUR: number;
}

export interface RoutePoint {
  lugar: string;
  code?: string;
  distancia?: number;
  duracion?: string;
}

export interface Itinerary {
  vehiculos: string[];
  dias: number;
  incentivar: boolean;
  nacional: boolean;
  kms: {
    extra: number;
    total: number;
  };
  base: RoutePoint & {
    origen: {
      duracion: number;
      distancia: string;
    };
    destino: {
      duracion: number;
      distancia: string;
    };
  };
  origen: RoutePoint & {
    destino: {
      duracion: number;
      distancia: string;
    };
  };
  destino: RoutePoint & {
    base: {
      duracion: number;
      distancia: string;
    };
  };
  costo: {
    comun: number;
    viaticos: {
      comida: number;
      hotel: number;
      incentivo: number;
    };
    peaje: {
      salida: number;
      sapTGU: number;
      sapTLA: number;
      ptzSAP: number;
    };
    frontera: {
      autentica: number;
      extra: number;
    };
  };
  lastLocationUpdate?: number;
}

export interface LegacyVehicleCosts {
  modelo: string;
  costoDia: number;
  costoKm: number;
  kmsGal: number;
  galsTanque: number;
  autonomia: number;
  costoKmFuel?: number;
  costoKmOtros?: number;
  galsItinerario?: number;
  cFuelItinerario?: number;
  cDiaItinerario?: number;
  cKmItinerario?: number;
  cItinerarioLps?: number;
  cItinerarioUSD?: number;
  precioAl10?: number;
  precioAl15?: number;
  precioAl20?: number;
  precioAl25?: number;
  precioAl30?: number;
  precioAl10D?: number;
  precioAl15D?: number;
  precioAl20D?: number;
  precioAl25D?: number;
  precioAl30D?: number;
}

export interface AppOptions {
  rndLps: number;
  rndUSD: number;
  compraUSD: number;
  ventaUSD: number;
  precioFuel: number;
}

// Cost Models
export interface FuelCosts {
  consumption: number;
  cost: number;
  pricePerUnit: number;
}

export interface DriverExpenses {
  meals: number;
  lodging: number;
  days: number;
  total: number;
}

export interface VehicleCosts {
  distanceCost: number;
  dailyCost: number;
  total: number;
}

export interface RefuelingCosts {
  stops: number;
  costPerStop: number;
  total: number;
}

export interface DetailedCosts {
  fuel: FuelCosts;
  driver: DriverExpenses;
  vehicle: VehicleCosts;
  refueling: RefuelingCosts;
  total: number;
}

// Route and Location Models
export interface RouteSegment {
  origin: string;
  destination: string;
  distance: number;
  duration: number;
}

export interface RouteResult {
  totalDistance: number;
  totalTime: number;
  route: google.maps.DirectionsResult;
  segments: RouteSegment[];
}

export interface DistanceMatrixResult {
  origins: string[];
  destinations: string[];
  distances: number[][];
  durations: number[][];
}

// Quotation Models
export interface QuotationRequest {
  origin: string;
  destination: string;
  baseLocation: string;
  groupSize: number;
  extraMileage?: number;
}

export interface PricingOption {
  markup: number;
  cost: number;
  salePrice: number;
  salePriceUSD: number;
  salePriceHNL: number;
  recommended: boolean;
}

export interface QuotationResult {
  route: RouteResult;
  costs: DetailedCosts;
  vehicle: Vehicle;
  pricing: PricingOption[];
  parameters: SystemParameters;
}

// Cost Calculation Request
export interface CostCalculationRequest {
  route: RouteResult;
  vehicle: Vehicle;
  groupSize: number;
  extraMileage?: number;
}

// Error Handling
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  LOCATION_NOT_FOUND = 'LOCATION_NOT_FOUND'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
}

// Component Props Interfaces
export interface QuotationFormProps {
  onSubmit: (data: QuotationRequest) => void;
  loading: boolean;
}

export interface RouteMapProps {
  origin: google.maps.LatLng;
  destination: google.maps.LatLng;
  baseLocation: google.maps.LatLng;
  route?: google.maps.DirectionsResult;
}

export interface CostBreakdownProps {
  costs: DetailedCosts;
  vehicle: Vehicle;
  currency: 'USD' | 'HNL';
}

export interface PricingTableProps {
  baseCost: number;
  markupOptions: number[];
  recommendedMarkup: number;
  exchangeRate: number;
}

export interface VehicleSelectorProps {
  vehicles: Vehicle[];
  groupSize: number;
  onVehicleSelect: (vehicles: Vehicle[] | Vehicle | null) => void;
  selectedVehicle?: Vehicle | Vehicle[];
}

// Export service interfaces and utility types
export * from './services';
export * from './utils';