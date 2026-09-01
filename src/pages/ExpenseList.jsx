import React, { useState, useMemo } from 'react';
import { ExpenseCard } from '../components/ExpenseCard';
import { isSameDay, isThisWeek, isThisMonth } from '../utils/dates';
import { CATEGORIES } from '../utils/categories';
import { formatTND } from '../utils/currency';
import { Search, Filter, Calendar, Layers } from 'lucide-react';

export const ExpenseList = ({ expenses, onDeleteExpense }) => {
  const [timeFilter, setTimeFilter] = useState('month'); // 'today', 'week', 'month', 'all'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrage combiné en temps réel
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // 1. Filtre Temporel
      if (timeFilter === 'today' && !isSameDay(exp.date, new Date())) return false;
      if (timeFilter === 'week' && !isThisWeek(exp.date)) return false;
      if (timeFilter === 'month' && !isThisMonth(exp.date)) return false;

      // 2. Filtre par Catégorie
      if (categoryFilter !== 'all' && exp.categorie !== categoryFilter) return false;

      // 3. Filtre par Recherche Textuelle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = (exp.description || '').toLowerCase().includes(q);
        const matchesCat = (exp.categorie || '').toLowerCase().includes(q);
        if (!matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [expenses, timeFilter, categoryFilter, searchQuery]);

  // Total des dépenses filtrées
  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.montant) || 0), 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-4 pb-24">
      
      {/* Champ de Recherche et Filtres */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
        
        {/* Recherche Textuelle */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par libellé ou catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Filtres Temporels Rapid "Aujourd'hui", "Cette semaine", "Ce mois" */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'today', label: 'Aujourd\'hui' },
            { id: 'week', label: 'Cette semaine' },
            { id: 'month', label: 'Ce mois' },
            { id: 'all', label: 'Toutes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                timeFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Menu Déroulant par Catégorie */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="all">Toutes les catégories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Résumé du filtre actif */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <span>{filteredExpenses.length} transaction(s) trouvée(s)</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
          Total : {formatTND(filteredTotal)}
        </span>
      </div>

      {/* Liste des Cartes de Dépenses */}
      <div className="space-y-2">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onDelete={onDeleteExpense}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-6 space-y-2">
            <Layers className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Aucune dépense ne correspond aux filtres
            </p>
            <p className="text-xs text-gray-400">
              Essayez de modifier votre recherche ou d'ajouter une nouvelle dépense.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
