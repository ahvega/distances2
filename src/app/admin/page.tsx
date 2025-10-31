'use client';

import React, { useState } from 'react';
import { ParameterManagement, ParameterOverview, QuickParameterUpdate } from '@/components/Admin';
import { useParameterManagement } from '@/hooks/useParameterManagement';
import type { SystemParameters } from '@/types';

export default function AdminPage() {
  const {
    parameters,
    loading,
    error,
    updateParameter,
    updateParameters,
    resetToDefaults,
    refreshParameters
  } = useParameterManagement();

  const [showQuickUpdate, setShowQuickUpdate] = useState<{
    parameterKey: keyof SystemParameters;
    currentValue: any;
  } | null>(null);

  const handleParametersUpdated = (updatedParameters: SystemParameters) => {
    // Refresh the parameters to ensure consistency
    refreshParameters();
  };

  const handleParameterClick = (parameterKey: string) => {
    const currentValue = parameters[parameterKey as keyof SystemParameters];
    setShowQuickUpdate({
      parameterKey: parameterKey as keyof SystemParameters,
      currentValue
    });
  };

  const handleQuickUpdateComplete = (newValue: any) => {
    // Refresh parameters after quick update
    refreshParameters();
    setShowQuickUpdate(null);
  };

  if (loading && !parameters) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <i className="fas fa-exclamation-triangle"></i>
          <div>
            <h3 className="font-bold">Error Loading Admin Panel</h3>
            <div className="text-xs">{error}</div>
          </div>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="breadcrumbs text-sm">
            <ul>
              <li><a href="/">Home</a></li>
              <li>Administration</li>
            </ul>
          </div>
          <h1 className="text-4xl font-bold mt-2">System Administration</h1>
          <p className="text-base-content/70 mt-2">
            Manage system parameters, view change history, and configure application settings
          </p>
        </div>

        {/* Parameter Overview Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Parameter Overview</h2>
          <ParameterOverview
            parameters={parameters}
            onParameterClick={handleParameterClick}
          />
        </div>

        {/* Main Parameter Management */}
        <ParameterManagement
          onParametersUpdated={handleParametersUpdated}
        />

        {/* Quick Update Modal */}
        {showQuickUpdate && (
          <QuickParameterUpdate
            parameterKey={showQuickUpdate.parameterKey}
            currentValue={showQuickUpdate.currentValue}
            onUpdate={handleQuickUpdateComplete}
            onClose={() => setShowQuickUpdate(null)}
          />
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-base-content/50">
          <p>Transportation Quotation System - Admin Panel</p>
          <p className="text-sm mt-1">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}