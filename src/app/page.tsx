'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import DesktopLayout from '@/components/Layout/DesktopLayout';
import MobileLayout from '@/components/Layout/MobileLayout';
import ParameterIntegration from '@/components/Admin/ParameterIntegration';

export default function Home() {
  const { state } = useAppContext();
  const { loading, error } = state;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h2 className="heading-font text-xl font-semibold text-plannertours-dark">
            Cargando PlannerTours...
          </h2>
          <p className="opacity-70">Inicializando datos de la aplicación</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="heading-font text-xl font-semibold text-red-700 mb-2">
            Error al cargar la aplicación
          </h2>
          <p className="opacity-70 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            <i className="fas fa-refresh mr-2"></i>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Parameter Integration - ensures parameter changes apply to quotations */}
      <ParameterIntegration />

      {/* Desktop Layout */}
      <DesktopLayout />

      {/* Mobile Layout */}
      <MobileLayout />
    </div>
  );
}