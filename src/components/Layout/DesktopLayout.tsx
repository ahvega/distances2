'use client';

import React from 'react';
import DataForm from '@/components/Forms/DataForm';
import PricingDisplay from '@/components/Pricing/PricingDisplay';
import MapComponent from '@/components/Map/MapComponent';
import CostsDisplay from '@/components/Costs/CostsDisplay';
import ThemeToggle from '@/components/Common/ThemeToggle';
import { Panel } from '@/components/ui';

export default function DesktopLayout() {
  return (
    <div className="hidden lg:block min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
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
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 rounded-lg transition-all duration-200 text-slate-200 hover:text-white"
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

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Form */}
          <div className="col-span-4">
            <div className="sticky top-24">
              <Panel
                title="Datos del Viaje"
                subtitle="Configure su cotización"
                icon="fas fa-edit"
                headerGradient="from-emerald-500 to-teal-500"
                className="os-window"
              >
                <DataForm />
              </Panel>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="col-span-8 space-y-8">
            <Panel
              title="Ruta y Distancia"
              subtitle="Visualización del recorrido"
              icon="fas fa-map-marker-alt"
              headerGradient="from-violet-500 to-purple-500"
              className="os-window overflow-hidden"
            >
              <MapComponent />
            </Panel>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-8">
              <Panel
                title="Cotización"
                subtitle="Precios y márgenes"
                icon="fas fa-tag"
                headerGradient="from-amber-500 to-orange-500"
                className="os-window"
              >
                <PricingDisplay />
              </Panel>

              <Panel
                title="Costos Detallados"
                subtitle="Desglose completo"
                icon="fas fa-calculator"
                headerGradient="from-rose-500 to-pink-500"
                className="os-window"
              >
                <CostsDisplay />
              </Panel>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

