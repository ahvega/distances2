'use client';

import React, { useState } from 'react';
import LocationInput from '@/components/Forms/LocationInput';
import { PlaceResult } from '@/hooks/useGooglePlaces';
import { isGooglePlacesAvailable } from '@/utils/placesValidation';

export default function PlacesDemo() {
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [location, setLocation] = useState('');

  const handlePlaceSelect = (place: PlaceResult) => {
    setSelectedPlace(place);
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (!value.trim()) {
      setSelectedPlace(null);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Google Places API Demo
      </h2>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            isGooglePlacesAvailable() ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm">
            Google Places API: {isGooglePlacesAvailable() ? 'Disponible' : 'No disponible'}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Buscar ubicación:
        </label>
        <LocationInput
          value={location}
          onChange={handleLocationChange}
          onPlaceSelect={handlePlaceSelect}
          placeholder="Escribe una ubicación en Honduras..."
          icon="fa-map-marker-alt"
          enableAutocomplete={true}
          showValidation={true}
        />
      </div>

      {selectedPlace && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Lugar seleccionado:</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Descripción:</strong> {selectedPlace.description}
            </div>
            <div>
              <strong>Dirección:</strong> {selectedPlace.formattedAddress}
            </div>
            <div>
              <strong>Place ID:</strong> {selectedPlace.placeId}
            </div>
            {selectedPlace.geometry && (
              <div>
                <strong>Coordenadas:</strong> {' '}
                {selectedPlace.geometry.location.lat.toFixed(6)}, {' '}
                {selectedPlace.geometry.location.lng.toFixed(6)}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>
          Esta demo muestra la integración con Google Places API para autocompletar
          y validar ubicaciones en Honduras.
        </p>
      </div>
    </div>
  );
}