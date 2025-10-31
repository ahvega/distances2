'use client';

import React from 'react';
import DataForm from '@/components/Forms/DataForm';
import PricingDisplay from '@/components/Pricing/PricingDisplay';
import MapComponent from '@/components/Map/MapComponent';
import CostsDisplay from '@/components/Costs/CostsDisplay';
import ThemeToggle from '@/components/Common/ThemeToggle';

export default function DesktopLayout() {
  return (
    <div className="hidden lg:block min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Modern Header with Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <i className="fas fa-route text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  PlannerTours
                </h1>
                <p className="text-sm text-slate-400">Sistema de Cotización de Transporte v2.0</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <a
                href="/admin"
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 rounded-lg transition-all duration-200 text-slate-300 hover:text-white"
                title="System Administration"
              >
                <i className="fas fa-cog text-sm"></i>
                <span className="text-sm font-medium">Admin</span>
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Modern Grid Layout */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Form */}
          <div className="col-span-4">
            <div className="sticky top-24">
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                      <i className="fas fa-edit text-white text-sm"></i>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Datos del Viaje</h2>
                      <p className="text-sm text-slate-400">Configure su cotización</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <DataForm />
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="col-span-8 space-y-8">
            {/* Map Section */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
                    <i className="fas fa-map-marker-alt text-white text-sm"></i>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Ruta y Distancia</h2>
                    <p className="text-sm text-slate-400">Visualización del recorrido</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <MapComponent />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-8">
              {/* Pricing Card */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                      <i className="fas fa-tag text-white text-sm"></i>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Cotización</h2>
                      <p className="text-sm text-slate-400">Precios y márgenes</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <PricingDisplay />
                </div>
              </div>

              {/* Costs Card */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg">
                      <i className="fas fa-calculator text-white text-sm"></i>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Costos Detallados</h2>
                      <p className="text-sm text-slate-400">Desglose completo</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <CostsDisplay />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}