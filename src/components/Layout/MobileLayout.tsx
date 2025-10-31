'use client';

import React, { useState } from 'react';
import MobileNavigation from './MobileNavigation';
import DataForm from '@/components/Forms/DataForm';
import PricingDisplay from '@/components/Pricing/PricingDisplay';
import MapComponent from '@/components/Map/MapComponent';
import CostsDisplay from '@/components/Costs/CostsDisplay';
import ThemeToggle from '@/components/Common/ThemeToggle';

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
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="card-title">
                  <div className="badge badge-primary badge-lg">
                    <i className="fas fa-edit mr-2"></i>
                    Datos del Viaje
                  </div>
                </div>
                <DataForm />
              </div>
            </div>
          </div>
        );
      case 'precios':
        return (
          <div className="p-4">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="card-title">
                  <div className="badge badge-secondary badge-lg">
                    <i className="fas fa-tag mr-2"></i>
                    Cotización
                  </div>
                </div>
                <PricingDisplay />
              </div>
            </div>
          </div>
        );
      case 'mapa':
        return (
          <div className="p-4">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="card-title">
                  <div className="badge badge-success badge-lg">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    Ruta y Distancia
                  </div>
                </div>
                <MapComponent />
              </div>
            </div>
          </div>
        );
      case 'gastos':
        return (
          <div className="p-4">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="card-title">
                  <div className="badge badge-accent badge-lg">
                    <i className="fas fa-calculator mr-2"></i>
                    Costos Detallados
                  </div>
                </div>
                <CostsDisplay />
              </div>
            </div>
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