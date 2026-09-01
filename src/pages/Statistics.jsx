import React, { useState, useMemo } from 'react';
import { filterExpensesByRange } from '../utils/dates';
import { CATEGORIES, getCategoryById } from '../utils/categories';
import { formatTND } from '../utils/currency';
import { BarChart2, TrendingUp, Calendar, Zap, PieChart } from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Statistics = ({ expenses, isDarkMode }) => {
  const [period, setPeriod] = useState(30); // 7, 30, 90 jours

  // Dépenses de la période sélectionnée
  const periodExpenses = useMemo(() => {
    return filterExpensesByRange(expenses, period);
  }, [expenses, period]);

  // Total de la période
  const periodTotal = useMemo(() => {
    return periodExpenses.reduce((sum, e) => sum + (parseFloat(e.montant) || 0), 0);
  }, [periodExpenses]);

  // Daily average over the period
  const dailyAverage = periodTotal / period;

  // 1. Données Graphique en Courbe (Évolution temporelle)
  const lineChartData = useMemo(() => {
    const datesMap = {};
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      datesMap[key] = { label, total: 0 };
    }

    periodExpenses.forEach((exp) => {
      const dayKey = new Date(exp.date).toISOString().split('T')[0];
      if (datesMap[dayKey]) {
        datesMap[dayKey].total += parseFloat(exp.montant || 0);
      }
    });

    const entries = Object.values(datesMap);
    return {
      labels: entries.map(e => e.label),
      datasets: [
        {
          label: 'Dépenses Quotidiennes (TND)',
          data: entries.map(e => e.total),
          borderColor: '#2563EB',
          backgroundColor: isDarkMode ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.08)',
          fill: true,
          tension: 0.35,
          pointRadius: period <= 30 ? 3 : 1,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10B981',
        },
      ],
    };
  }, [periodExpenses, period, isDarkMode]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${formatTND(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280', font: { size: 9 }, maxRotation: 0 },
      },
      y: {
        grid: { color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280', font: { size: 10 } },
      },
    },
  };

  // 2. Données Graphique en Barres par Catégorie
  const categoryBarData = useMemo(() => {
    const sums = {};
    periodExpenses.forEach((exp) => {
      const cat = exp.categorie || 'Autres';
      sums[cat] = (sums[cat] || 0) + parseFloat(exp.montant || 0);
    });

    const sortedCats = Object.entries(sums).sort((a, b) => b[1] - a[1]);

    return {
      labels: sortedCats.map(([cat]) => cat),
      datasets: [
        {
          label: 'Montant Total (TND)',
          data: sortedCats.map(([, sum]) => sum),
          backgroundColor: sortedCats.map(([cat]) => getCategoryById(cat).color),
          borderRadius: 8,
        },
      ],
    };
  }, [periodExpenses]);

  const barOptions = {
    indexAxis: 'y', // Barres horizontales
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${formatTND(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280', font: { size: 10 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: isDarkMode ? '#e5e7eb' : '#374151', font: { size: 11, weight: '600' } },
      },
    },
  };

  return (
    <div className="space-y-4 pb-24">
      
      {/* En-tête & Sélecteur de Période (7j, 30j, 90j) */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-1.5">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Statistiques Avancées</span>
          </h2>
          <p className="text-xs text-gray-400">Période d'analyse dynamique</p>
        </div>

        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700/60 p-1 rounded-2xl">
          {[7, 30, 90].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === p
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              {p}j
            </button>
          ))}
        </div>
      </div>

      {/* Cartes de Synthèse de Période */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl p-4 shadow-md shadow-blue-500/20">
          <span className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider block">
            Total {period} Derniers Jours
          </span>
          <div className="text-2xl font-extrabold mt-1">
            {formatTND(periodTotal)}
          </div>
          <p className="text-[10px] text-blue-200 mt-1">
            {periodExpenses.length} transaction(s) au total
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-4 shadow-md shadow-emerald-500/20">
          <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider block">
            Moyenne sur {period}j
          </span>
          <div className="text-2xl font-extrabold mt-1">
            {formatTND(dailyAverage)}
          </div>
          <p className="text-[10px] text-emerald-200 mt-1">
            par jour en moyenne
          </p>
        </div>
      </div>

      {/* Graphique 1: Évolution Temporelle en Courbe */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Évolution des Dépenses sur {period} Jours
          </h3>
        </div>
        <div className="h-56 w-full">
          <Line data={lineChartData} options={lineOptions} />
        </div>
      </div>

      {/* Graphique 2: Barres par Catégorie */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
        <div className="flex items-center space-x-2 mb-3">
          <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Répartition par Catégorie ({period}j)
          </h3>
        </div>
        <div className="h-56 w-full">
          {categoryBarData.labels.length > 0 ? (
            <Bar data={categoryBarData} options={barOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              Aucune donnée disponible pour cette période
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
