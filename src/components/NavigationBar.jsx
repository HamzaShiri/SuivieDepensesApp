import React from 'react';
import { LayoutDashboard, ListFilter, BarChart3, Settings, Plus } from 'lucide-react';

export const NavigationBar = ({ activeTab, setActiveTab, onOpenAddModal }) => {
  const tabs = [
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
    { id: 'list', label: 'Dépenses', icon: ListFilter },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Réglages', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200/80 dark:border-gray-800 px-4 py-2 transition-colors shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[11px]">{tab.label}</span>
            </button>
          );
        })}

        {/* Bouton Flottant (FAB) + en Bas à Droite */}
        <button
          onClick={onOpenAddModal}
          aria-label="Ajouter une dépense"
          className="absolute -top-7 right-3 w-14 h-14 bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-white dark:ring-gray-900"
        >
          <Plus className="w-8 h-8 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
