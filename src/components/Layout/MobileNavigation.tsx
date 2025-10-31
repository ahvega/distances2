'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon: string;
  color?: string;
}

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Tab[];
}

export default function MobileNavigation({ activeTab, onTabChange, tabs }: MobileNavigationProps) {
  return (
    <div className="lg:hidden btm-nav btm-nav-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={activeTab === tab.id ? 'active' : ''}
        >
          <i className={`${tab.icon} text-lg`}></i>
          <span className="btm-nav-label text-xs heading-font">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}