import { LegacyVehicle, LegacyVehicleCosts, Itinerary, AppOptions } from '@/types';

/**
 * Vehicle cost calculation class - ported from legacy code
 */
export class VehicleCalculator {
  modelo: string;
  costoDia: number;
  costoKm: number;
  kmsGal: number;
  galsTanque: number;
  autonomia: number;

  // Calculated properties
  costoKmFuel?: number;
  costoKmOtros?: number;
  galsItinerario?: number;
  cFuelItinerario?: number;
  cDiaItinerario?: number;
  cKmItinerario?: number;
  cItinerarioLps?: number;
  cItinerarioUSD?: number;

  // Pricing tiers
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

  constructor(vehicle: LegacyVehicle) {
    this.modelo = vehicle.nombre;
    this.costoDia = parseFloat(vehicle.costo_por_dia);
    this.costoKm = parseFloat(vehicle.costo_por_km);
    this.kmsGal = vehicle.rendimiento;
    this.galsTanque = parseFloat(vehicle.galones_tanque);
    this.autonomia = this.kmsGal * this.galsTanque;
  }

  calcCostos(itinerary: Itinerary, options: AppOptions): void {
    const { kms, dias, costo } = itinerary;
    const { precioFuel, compraUSD } = options;

    // Calculate fuel and other costs per km
    this.costoKmFuel = Math.round((precioFuel / this.kmsGal) * 1000000) / 1000000;
    this.costoKmOtros = Math.round((this.costoKm - (100 / this.kmsGal)) * 1000000) / 1000000;

    // Calculate itinerary costs
    this.galsItinerario = Math.round(kms.total / this.kmsGal);
    this.cFuelItinerario = this.galsItinerario * precioFuel;
    this.cDiaItinerario = Math.round(dias * this.costoDia);
    this.cKmItinerario = Math.round((kms.total * this.costoKmFuel) + (kms.total * this.costoKmOtros));
    this.cItinerarioLps = this.cDiaItinerario + this.cKmItinerario + costo.comun;
    this.cItinerarioUSD = Math.round((this.cItinerarioLps / compraUSD) * 10000) / 10000;

    // Calculate pricing tiers
    this.precioAl30 = rndMoney(calcPrecio(this.cItinerarioLps, 30), 'L', options);
    this.precioAl25 = rndMoney(calcPrecio(this.cItinerarioLps, 25), 'L', options);
    this.precioAl20 = rndMoney(calcPrecio(this.cItinerarioLps, 20), 'L', options);
    this.precioAl15 = rndMoney(calcPrecio(this.cItinerarioLps, 15), 'L', options);
    this.precioAl10 = rndMoney(calcPrecio(this.cItinerarioLps, 10), 'L', options);

    this.precioAl30D = rndMoney(this.precioAl30, '$', options);
    this.precioAl25D = rndMoney(this.precioAl25, '$', options);
    this.precioAl20D = rndMoney(this.precioAl20, '$', options);
    this.precioAl15D = rndMoney(this.precioAl15, '$', options);
    this.precioAl10D = rndMoney(this.precioAl10, '$', options);
  }

  getCosts(): LegacyVehicleCosts {
    return {
      modelo: this.modelo,
      costoDia: this.costoDia,
      costoKm: this.costoKm,
      kmsGal: this.kmsGal,
      galsTanque: this.galsTanque,
      autonomia: this.autonomia,
      costoKmFuel: this.costoKmFuel,
      costoKmOtros: this.costoKmOtros,
      galsItinerario: this.galsItinerario,
      cFuelItinerario: this.cFuelItinerario,
      cDiaItinerario: this.cDiaItinerario,
      cKmItinerario: this.cKmItinerario,
      cItinerarioLps: this.cItinerarioLps,
      cItinerarioUSD: this.cItinerarioUSD,
      precioAl10: this.precioAl10,
      precioAl15: this.precioAl15,
      precioAl20: this.precioAl20,
      precioAl25: this.precioAl25,
      precioAl30: this.precioAl30,
      precioAl10D: this.precioAl10D,
      precioAl15D: this.precioAl15D,
      precioAl20D: this.precioAl20D,
      precioAl25D: this.precioAl25D,
      precioAl30D: this.precioAl30D,
    };
  }
}

/**
 * Calculate price with margin
 */
function calcPrecio(costo: number, margen: number): number {
  return costo / (1 - margen / 100);
}

/**
 * Round money values according to currency
 */
function rndMoney(valor: number, moneda: string, options: AppOptions): number {
  if (moneda === 'L') {
    return Math.round(valor / options.rndLps) * options.rndLps;
  } else if (moneda === '$') {
    return Math.round((valor / options.ventaUSD) / options.rndUSD) * options.rndUSD;
  }
  return valor;
}

/**
 * Calculate toll costs based on route geography
 */
export function calculateTollCosts(
  itinerary: Itinerary,
  parameters: Record<string, any>
): {
  sapTGU: number;
  sapTLA: number;
  ptzSAP: number;
  salida: number;
} {
  const { base, origen, destino } = itinerary;

  // Determine route characteristics
  const baseCode = base.lugar.includes('San Pedro Sula') ? 'SAP' :
                   base.lugar.includes('Tegucigalpa') ? 'TGU' : '';

  const esSAPTGU = destino.lugar.includes('Tegucigalpa') ||
                   destino.lugar.includes('Choluteca') ||
                   destino.lugar.includes('San Lorenzo') ||
                   destino.lugar.includes('La Paz') ||
                   destino.lugar.includes('Marcala') ||
                   destino.lugar.includes('Juticalpa') ||
                   destino.lugar.includes('Catacamas') ||
                   destino.lugar.includes('Zambrano') ||
                   destino.lugar.includes('El Paraiso') ||
                   destino.lugar.includes('Danli') ||
                   destino.lugar.includes('Valle de Angeles') ||
                   destino.lugar.includes('Costa Rica') ||
                   destino.lugar.includes('Nicaragua') ||
                   destino.lugar.includes('Panama');

  const esSIG = origen.lugar.includes('Siguatepeque') || destino.lugar.includes('Siguatepeque');
  const esCOM = origen.lugar.includes('Comayagua') || destino.lugar.includes('Comayagua');
  const esPTZ = origen.lugar.includes('Cortés') || destino.lugar.includes('Cortés');
  const esTLA = origen.lugar.includes('Tela') || destino.lugar.includes('Tela') ||
                origen.lugar.includes('Progreso') || destino.lugar.includes('Progreso');
  const esLCE = origen.lugar.includes('La Ceiba') || destino.lugar.includes('La Ceiba') ||
                origen.lugar.includes('Sambo') || destino.lugar.includes('Sambo') ||
                origen.lugar.includes('Trujillo') || destino.lugar.includes('Trujillo');

  // Calculate tolls
  let sapTGU = 0;
  let sapTLA = 0;
  let ptzSAP = 0;
  let salida = 0;

  if (baseCode === 'SAP') {
    sapTGU = esSIG ? (parameters.peaje_sap_yojoa?.valor || 0) * 2 : 0;
    sapTGU = esCOM ? ((parameters.peaje_sap_yojoa?.valor || 0) + (parameters.peaje_sap_siguatepeque?.valor || 0)) * 2 : sapTGU;
  } else if (baseCode === 'TGU') {
    sapTGU = esCOM ? (parameters.peaje_sap_zambrano?.valor || 0) * 2 : 0;
    sapTGU = esSIG ? ((parameters.peaje_sap_zambrano?.valor || 0) + (parameters.peaje_sap_siguatepeque?.valor || 0)) * 2 : sapTGU;
  }

  if (esSAPTGU) {
    sapTGU = ((parameters.peaje_sap_yojoa?.valor || 0) +
              (parameters.peaje_sap_siguatepeque?.valor || 0) +
              (parameters.peaje_sap_zambrano?.valor || 0)) * 2;

    if ((baseCode === 'SAP' && origen.lugar.includes('Tegucigalpa')) ||
        (baseCode === 'TGU' && origen.lugar.includes('San Pedro Sula'))) {
      sapTGU = sapTGU * 2;
    }
  }

  salida = parameters.peaje_salida_sap?.valor || 0;
  ptzSAP = esPTZ && parameters.peaje_salida_ptz ? parameters.peaje_salida_ptz.valor : 0;
  sapTLA = (esTLA || esLCE) && parameters.peaje_san_manuel ? parameters.peaje_san_manuel.valor * 2 : 0;

  return { sapTGU, sapTLA, ptzSAP, salida };
}

/**
 * Calculate travel expenses
 */
export function calculateTravelExpenses(
  itinerary: Itinerary,
  parameters: Record<string, any>
): {
  incentivo: number;
  comida: number;
  hotel: number;
  autentica: number;
  extra: number;
} {
  const { dias, nacional, incentivar } = itinerary;
  const ventaUSD = 24.66; // Should come from options

  let incentivo = 0;
  let comida = 0;
  let hotel = 0;
  let autentica = 0;
  let extra = 0;

  if (nacional) {
    incentivo = parameters.incentivo_hn?.valor || 0;
    comida = (parameters.alimentacion_hn?.valor || 0) * 3;
    hotel = parameters.hotel_hn_1?.valor || 0;
  } else {
    incentivo = Math.round((parameters.incentivo_ca?.valor || 0) * ventaUSD);
    comida = Math.round((parameters.alimentacion_ca?.valor || 0) * ventaUSD * 3);
    hotel = Math.round((parameters.hotel_ca?.valor || 0) * ventaUSD);
    extra = Math.round((parameters.gastos_frontera?.valor || 0) * ventaUSD);
    autentica = parameters.autentica?.valor || 0;
  }

  incentivo = incentivar ? incentivo : 0;

  return { incentivo, comida, hotel, autentica, extra };
}

/**
 * Format numbers with units - ported from legacy code
 */
export function formatUnits(
  value: number,
  unit?: string,
  cents: number = 0,
  suffix?: boolean
): string {
  const sign = value < 0 ? '-' : '';
  const number = Math.abs(value);
  const unitStr = unit || '';

  const formatted = number.toFixed(cents).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  if (suffix === undefined && unit && (unit.length > 1 || unit === '€')) {
    suffix = true;
  }

  const result = suffix ?
    `${sign}${formatted} ${unitStr}` :
    `${unitStr} ${sign}${formatted}`;

  return result.trim();
}