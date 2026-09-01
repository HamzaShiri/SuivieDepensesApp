import React from 'react';
import { StatCard } from '../components/StatCard';
import { ExpenseCard } from '../components/ExpenseCard';
import { formatTND } from '../utils/currency';
import {
  calculateMonthlyTotal,
  calculateDailyAverage,
  calculateTopCategory,
  calculateLast7DaysChartData,
  calculateCategoryPieData
} from '../utils/dates';
import { getCategoryById } from '../utils/categories';
import { Wallet, TrendingUp, PieChart as PieIcon, Calendar, Plus, ArrowRight, Award } from 'lucide-react';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

export const Dashboard = ({ expenses, monthlyBudget, onNavigate, onDeleteExpense, isDarkMode }) => {
  const monthlyTotal = calculateMonthlyTotal(expenses);
  const dailyAverage = calculateDailyAverage(expenses);
  const topCategory = calculateTopCategory(expenses);
  const topCatDetails = getCategoryById(topCategory.name);

  // Données Graphique Camembert (Répartition par Catégorie)
  const pieRaw = calculateCategoryPieData(expenses);
  const pieColors = pieRaw.labels.map(l => getCategoryById(l).color);

  const pieChartData = {
    labels: pieRaw.labels,
    datasets: [
      {
        data: pieRaw.data,
        backgroundColor: pieColors.length > 0 ? pieColors : ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        borderWidth: 2,
        borderColor: isDarkMode ? '#1f2937' : '#ffffff',
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          font: { size: 11, weight: '600' },
          padding: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${formatTND(context.raw)}`,
        },
      },
    },
  };

  // Données Graphique Barres (Dépenses 7 Derniers Jours)
  const barRaw = calculateLast7DaysChartData(expenses);
  const barChartData = {
    labels: barRaw.labels,
    datasets: [
      {
        label: 'Dépenses (TND)',
        data: barRaw.data,
        backgroundColor: 'rgba(37, 99, 235, 0.85)',
        hoverBackgroundColor: '#10B981',
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
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
        ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280', font: { size: 10 } },
      },
      y: {
        grid: { color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280', font: { size: 10 } },
      },
    },
  };

  // 4 Dernières transactions
  const recentExpenses = expenses.slice(0, 4);

  return (
    <div className="space-y-5 pb-20">
      
      {/* 3 Cartes KPI du haut */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          title="Total Mois"
          value={formatTND(monthlyTotal)}
          subtitle={`Objectif: ${monthlyBudget} TND`}
          icon={Wallet}
          colorTheme="blue"
        />
        <StatCard
          title="Moy. / Jour"
          value={formatTND(dailyAverage)}
          subtitle="Basé sur 30j"
          icon={TrendingUp}
          colorTheme="emerald"
        />
        <StatCard
          title="Top Catégorie"
          value={topCategory.name}
          subtitle={formatTND(topCategory.amount)}
          icon={Award}
          colorTheme="purple"
        />
      </div>

      {/* Barre de Progression du Budget */}
      {monthlyBudget > 0 && (
        <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-gray-600 dark:text-gray-300">Suivi du Budget Mensuel</span>
            <span className={monthlyTotal > monthlyBudget ? 'text-red-500 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
              {formatTND(monthlyTotal)} / {formatTND(monthlyBudget)}
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                monthlyTotal > monthlyBudget
                  ? 'bg-gradient-to-r from-red-500 to-rose-600'
                  : (monthlyTotal / monthlyBudget) > 0.8
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                  : 'bg-gradient-to-r from-blue-600 to-emerald-500'
              }`}
              style={{ width: `${Math.min(Math.round((monthlyTotal / monthlyBudget) * 100), 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Graphique 1: Répartition par Catégorie (Camembert) */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <PieIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Répartition par Catégorie (Ce Mois)
            </h3>
          </div>
        </div>
        <div className="h-52 w-full relative">
          {pieRaw.data.length > 0 ? (
            <Pie data={pieChartData} options={pieOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              Aucune dépense ce mois-ci
            </div>
          )}
        </div>
      </div>

      {/* Graphique 2: Dépenses des 7 derniers jours (Barres) */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Dépenses des 7 Derniers Jours
            </h3>
          </div>
        </div>
        <div className="h-44 w-full">
          <Bar data={barChartData} options={barOptions} />
        </div>
      </div>

      {/* Liste des Dépenses Récents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Dernières Transactions
          </h3>
          <button
            onClick={() => onNavigate('list')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>Voir tout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((exp) => (
              <ExpenseCard
                key={exp.id}
                expense={exp}
                onDelete={onDeleteExpense}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs bg-white dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              Aucune transaction enregistrée. Cliquez sur "+" pour ajouter une dépense !
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
