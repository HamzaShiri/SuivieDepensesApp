import React from 'react';
import { Bell, Wallet, Sparkles } from 'lucide-react';
import { formatTND } from '../utils/currency';

export const Header = ({ title = "💰 Mes Dépenses", monthlyTotal, monthlyBudget, onOpenSettings }) => {
  const percentageUsed = monthlyBudget > 0 ? Math.min(Math.round((monthlyTotal / monthlyBudget) * 100), 100) : 0;
  const isBudgetWarning = percentageUsed >= 85;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 shadow-xs transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Gestionnaire en Dinars Tunisiens
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Badge du Budget Mensuel */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              isBudgetWarning
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 animate-pulse'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            }`}
            title="Consulter le budget mensuel"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{percentageUsed}% Budget</span>
          </button>
        </div>
      </div>
    </header>
  );
};
