'use client';

import React, { useState } from 'react';
import MobileNavigation from './MobileNavigation';
import DataForm from '@/components/Forms/DataForm';
import PricingDisplay from '@/components/Pricing/PricingDisplay';
import MapComponent from '@/components/Map/MapComponent';
import CostsDisplay from '@/components/Costs/CostsDisplay';
import ThemeToggle from '@/components/Common/ThemeToggle';
import { Panel } from '@/components/ui';

const tabs = [
  { id: 'datos', label: 'Datos', icon: 'fas fa-edit', color: 'from-blue-500 to-cyan-500' },
  { id: 'mapa', label: 'Mapa', icon: 'fas fa-map-marker-alt', color: 'from-green-500 to-emerald-500' },
  { id: 'precios', label: 'Precios', icon: 'fas fa-tag', color: 'from-purple-500 to-pink-500' },
  { id: 'gastos', label: 'Gastos', icon: 'fas fa-calculator', color: 'from-orange-500 to-red-500' },
];

export default function MobileLayout() {
  const [activeTab, setActiveTab] = useState('datos');

  const renderTabContent = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);

    switch (activeTab) {
      case 'datos':
        return (
          <div className="p-4">
            <Panel
              title="Datos del Viaje"
              subtitle="Configure su cotización"
              icon="fas fa-edit"
              headerGradient="from-blue-500 to-cyan-500"
            >
              <DataForm />
            </Panel>
          </div>
        );
      case 'precios':
        return (
          <div className="p-4">
            <Panel
              title="Cotización"
              subtitle="Resumen y totales"
              icon="fas fa-tag"
              headerGradient="from-purple-500 to-pink-500"
            >
              <PricingDisplay />
            </Panel>
          </div>
        );
      case 'mapa':
        return (
          <div className="p-4">
            <Panel
              title="Ruta y Distancia"
              subtitle="Visualización del recorrido"
              icon="fas fa-map-marker-alt"
              headerGradient="from-green-500 to-emerald-500"
            >
              <MapComponent />
            </Panel>
          </div>
        );
      case 'gastos':
        return (
          <div className="p-4">
            <Panel
              title="Costos Detallados"
              subtitle="Desglose por categoría"
              icon="fas fa-calculator"
              headerGradient="from-orange-500 to-red-500"
            >
              <CostsDisplay />
            </Panel>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="lg:hidden min-h-screen">
      <div className="navbar bg-primary text-primary-content sticky top-0 z-40 shadow-lg">
        <div className="flex-1">
          <div>
            <h1 className="heading-font text-lg font-bold">PlannerTours</h1>
            <p className="text-sm opacity-80">
              {tabs.find(tab => tab.id === activeTab)?.label || 'Cotización'}
            </p>
          </div>
        </div>
        <div className="flex-none gap-2">
          <a
            href="/admin"
            className="btn btn-ghost btn-sm"
            title="System Administration"
          >
            <i className="fas fa-cog"></i>
          </a>
          <ThemeToggle />
        </div>
      </div>

      <main className="mobile-content min-h-screen bg-base-200">
        {renderTabContent()}
      </main>

      <MobileNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />
    </div>
  );
}
