'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useRouteCalculation } from '@/hooks/useGoogleMaps';
import ErrorBoundary from '@/components/Common/ErrorBoundary';

interface MapComponentProps {
  showAlternativeRoutes?: boolean;
  enableRouteSelection?: boolean;
  onRouteSelected?: (routeIndex: number) => void;
}

export default function MapComponent({
  showAlternativeRoutes: _showAlternativeRoutes,
  enableRouteSelection: _enableRouteSelection,
  onRouteSelected: _onRouteSelected
}: MapComponentProps) {
  const { state, dispatch } = useAppContext();
  const { itinerary } = state;
  const { isLoaded, calculateRoute } = useRouteCalculation();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [markers, setMarkers] = useState<{
    base?: any;
    origin?: any;
    destination?: any;
  }>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    const g: any = (globalThis as any).google;
    if (isLoaded && g && mapRef.current && !map) {
      const newMap = new g.maps.Map(mapRef.current, {
        center: { lat: 15.49, lng: -88.03 }, // San Pedro Sula
        zoom: 10,
        mapTypeId: g.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      const renderer = new g.maps.DirectionsRenderer({
        map: newMap,
        draggable: false,
        polylineOptions: {
          strokeColor: '#2563eb',
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
        markerOptions: {
          visible: false, // We'll use custom markers
        },
      });

      setMap(newMap);
      setDirectionsRenderer(renderer);

      // Trigger resize event
      g.maps.event.trigger(newMap, 'resize');
    }
  }, [isLoaded, map]);

  // Create custom markers for locations
  const createLocationMarkers = (map: google.maps.Map) => {
    // Clear existing markers
    Object.values(markers).forEach(marker => marker?.setMap(null));

    const newMarkers: typeof markers = {};

    // Create geocoder for location coordinates
    const g: any = (globalThis as any).google;
    if (!g) return;
    const geocoder = new g.maps.Geocoder();

    // Create simple markers using the legacy Marker for now (will be updated in future)
    // Base location marker (green)
    if (itinerary.base.lugar) {
      geocoder.geocode({ address: itinerary.base.lugar }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          // Using legacy Marker temporarily to avoid deprecation warnings
          const marker = new (g.maps as any).Marker({
            position: results[0].geometry.location,
            map,
            title: `Base: ${itinerary.base.lugar}`,
            icon: {
              path: g.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#10b981',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          const infoWindow = new g.maps.InfoWindow({
            content: `<div class="p-2"><strong>Base Location</strong><br/>${itinerary.base.lugar}</div>`,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          newMarkers.base = marker;
        }
      });
    }

    // Origin marker (blue)
    if (itinerary.origen.lugar) {
      geocoder.geocode({ address: itinerary.origen.lugar }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const marker = new (g.maps as any).Marker({
            position: results[0].geometry.location,
            map,
            title: `Origin: ${itinerary.origen.lugar}`,
            icon: {
              path: g.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#2563eb',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          const infoWindow = new g.maps.InfoWindow({
            content: `<div class="p-2"><strong>Origin</strong><br/>${itinerary.origen.lugar}</div>`,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          newMarkers.origin = marker;
        }
      });
    }

    // Destination marker (red)
    if (itinerary.destino.lugar) {
      geocoder.geocode({ address: itinerary.destino.lugar }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const marker = new (google.maps as any).Marker({
            position: results[0].geometry.location,
            map,
            title: `Destination: ${itinerary.destino.lugar}`,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#dc2626',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `<div class="p-2"><strong>Destination</strong><br/>${itinerary.destino.lugar}</div>`,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          newMarkers.destination = marker;
        }
      });
    }

    setMarkers(newMarkers);
  };

  // Update markers when locations change
  useEffect(() => {
    if (map && (itinerary.base.lugar || itinerary.origen.lugar || itinerary.destino.lugar)) {
      createLocationMarkers(map);
    }
  }, [map, itinerary.base.lugar, itinerary.origen.lugar, itinerary.destino.lugar]);

  // Calculate route when locations are finalized (on blur/enter)
  useEffect(() => {
    if (isLoaded && map && directionsRenderer &&
        itinerary.base.lugar && itinerary.origen.lugar && itinerary.destino.lugar &&
        itinerary.lastLocationUpdate) {
      handleRouteCalculation();
    }
  }, [isLoaded, map, directionsRenderer, itinerary.lastLocationUpdate]);

  const handleRouteCalculation = async () => {
    if (!calculateRoute || isCalculating) return;

    // Validate locations before making API calls
    const baseLocation = itinerary.base.lugar?.trim();
    const origenLocation = itinerary.origen.lugar?.trim();
    const destinoLocation = itinerary.destino.lugar?.trim();

    if (!baseLocation || !origenLocation || !destinoLocation) {
      setRouteError('Todas las ubicaciones (base, origen, destino) deben estar completas para calcular la ruta.');
      return;
    }

    setIsCalculating(true);
    setRouteError(null);

    try {
      const result = await calculateRoute({
        base: baseLocation,
        origen: origenLocation,
        destino: destinoLocation,
      });

      if (result && directionsRenderer) {
        // Display the main route
        directionsRenderer.setDirections(result.route);

        // Update itinerary with calculated distances
        const updatedItinerary = {
          ...itinerary,
          base: {
            ...itinerary.base,
            origen: {
              distancia: Math.round((result.baseToOrigen.distance?.value || 0) / 1000).toString(),
              duracion: Math.round((result.baseToOrigen.duration?.value || 0) / 60), // Convert to minutes
            }
          },
          origen: {
            ...itinerary.origen,
            destino: {
              distancia: Math.round((result.origenToDestino.distance?.value || 0) / 1000).toString(),
              duracion: Math.round((result.origenToDestino.duration?.value || 0) / 60), // Convert to minutes
            }
          },
          destino: {
            ...itinerary.destino,
            base: {
              distancia: Math.round((result.destinoToBase.distance?.value || 0) / 1000).toString(),
              duracion: Math.round((result.destinoToBase.duration?.value || 0) / 60), // Convert to minutes
            }
          },
          kms: {
            ...itinerary.kms,
            total: result.totalDistance + (itinerary.kms.extra * itinerary.dias),
          }
        };

        dispatch({
          type: 'UPDATE_ITINERARY',
          payload: updatedItinerary
        });

        // Create info window content
        const route = result.route.routes[0];
        const leg = route.legs[0];
        const distance = Math.round((leg.distance?.value || 0) / 1000);
        const duration = leg.duration?.text || 'N/A';

        const infoContent = `
          <div class="p-3 bg-white rounded-lg shadow-lg">
            <h4 class="font-semibold mb-2 text-gray-800">Información de Ruta</h4>
            <div class="text-sm space-y-1">
              <p><strong>Desde:</strong> ${itinerary.origen.lugar}</p>
              <p><strong>Hacia:</strong> ${itinerary.destino.lugar}</p>
              <p><strong>Distancia:</strong> ${distance} Kms</p>
              <p><strong>Duración:</strong> ${duration}</p>
            </div>
          </div>
        `;

        // Create info window
        const g: any = (globalThis as any).google;
        if (!g) return;
        const infoWindow = new g.maps.InfoWindow({
          content: infoContent,
          position: (route.overview_path && route.overview_path[Math.floor(route.overview_path.length / 2)]) || undefined,
        });

        infoWindow.open(map);

      } else {
        setRouteError('No se pudo calcular la ruta. Verifica que las ubicaciones sean válidas y estén en Honduras.');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al calcular la ruta';
      setRouteError(errorMessage);
    } finally {
      setIsCalculating(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-md"></span>
        <span className="ml-2">Cargando Google Maps...</span>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="alert alert-error">
          <i className="fas fa-exclamation-triangle"></i>
          <div>
            <h3 className="font-bold">Error en el Mapa</h3>
            <div className="text-xs">No se pudo cargar el componente del mapa</div>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-base-content/70">
            Ingresa las ubicaciones y presiona Enter o sal del campo
          </div>
          <button
            onClick={handleRouteCalculation}
            disabled={isCalculating || !itinerary.base.lugar || !itinerary.origen.lugar || !itinerary.destino.lugar}
            className="btn btn-primary btn-sm"
          >
            {isCalculating ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Calculando...
              </>
            ) : (
              <>
                <i className="fas fa-route"></i>
                Calcular Ruta
              </>
            )}
          </button>
        </div>

        {routeError && (
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <h4 className="font-bold">Error de Ruta</h4>
              <div className="text-xs">{routeError}</div>
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setRouteError(null)}
            >
              Cerrar
            </button>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
        />

        {itinerary.kms.total > 0 && (
          <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Resumen de Ruta</h4>
            <div className="text-sm space-y-1 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Distancia Total</span><span className="font-medium">{itinerary.kms.total} Kms</span></div>
              {itinerary.base.lugar !== itinerary.origen.lugar && (
                <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Base → Origen</span><span className="font-medium">{itinerary.base.origen.distancia} Kms</span></div>
              )}
              <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Origen → Destino</span><span className="font-medium">{itinerary.origen.destino.distancia} Kms</span></div>
              {itinerary.kms.extra > 0 && (
                <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300">Kms Extra</span><span className="font-medium">{itinerary.kms.extra} Kms</span></div>
              )}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
