import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured, setMonthlyBudget, getMonthlyBudget } from '../services/supabaseClient';
import { requestNotificationPermission } from '../services/notificationService';
import { Settings as SettingsIcon, Moon, Sun, Bell, Database, Wallet, Download, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export const Settings = ({
  monthlyBudget,
  onUpdateBudget,
  isDarkMode,
  onToggleTheme,
  onShowToast
}) => {
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('notifications_enabled') !== 'false'
  );
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('supabase_key') || '');
  const [supabaseStatus, setSupabaseStatus] = useState(isSupabaseConfigured());

  useEffect(() => {
    setBudgetInput(monthlyBudget.toString());
  }, [monthlyBudget]);

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (val && val > 0) {
      onUpdateBudget(val);
      onShowToast('Budget mensuel mis à jour !', 'success');
    }
  };

  const handleToggleNotifications = async () => {
    const nextState = !notificationsEnabled;
    if (nextState) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        onShowToast('Permission notification refusée par le navigateur', 'error');
        return;
      }
    }
    setNotificationsEnabled(nextState);
    localStorage.setItem('notifications_enabled', nextState ? 'true' : 'false');
    onShowToast(`Notifications ${nextState ? 'activées' : 'désactivées'}`, 'success');
  };

  const handleSaveSupabaseConfig = (e) => {
    e.preventDefault();
    if (supabaseUrl && supabaseKey) {
      localStorage.setItem('supabase_url', supabaseUrl.trim());
      localStorage.setItem('supabase_key', supabaseKey.trim());
      setSupabaseStatus(true);
      onShowToast('Connexion Supabase configurée avec succès !', 'success');
      window.location.reload(); // Recharge pour ré-initialiser le client Supabase
    }
  };

  const handleClearSupabaseConfig = () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_key');
    setSupabaseUrl('');
    setSupabaseKey('');
    setSupabaseStatus(false);
    onShowToast('Bascule sur le mode LocalStorage local', 'success');
  };

  const handleExportCSV = () => {
    const rawData = localStorage.getItem('local_depenses');
    if (!rawData) return;
    try {
      const expenses = JSON.parse(rawData);
      let csvContent = "data:text/csv;charset=utf-8,ID,Description,Montant_TND,Categorie,Date\n";
      expenses.forEach(e => {
        csvContent += `"${e.id}","${e.description}",${e.montant},"${e.categorie}","${e.date}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `depenses_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast('Fichier CSV exporté !', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto">
      
      {/* En-tête Paramètres */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Paramètres & Configuration
          </h2>
          <p className="text-xs text-gray-400">Personnalisez votre application</p>
        </div>
      </div>

      {/* SECTION 1: BUDGET MENSUEL */}
      <form onSubmit={handleSaveBudget} className="bg-white dark:bg-gray-800/90 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
        <div className="flex items-center space-x-2">
          <Wallet className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Budget Mensuel Objectif
          </h3>
        </div>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="number"
              step="10"
              required
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
              TND
            </span>
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all"
          >
            Enregistrer
          </button>
        </div>
      </form>

      {/* SECTION 2: THÈME & NOTIFICATIONS */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Préférences d'Affichage & Alertes
        </h3>

        {/* Switch Thème Clair / Sombre */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 block">Thème Visuel</span>
              <span className="text-xs text-gray-400">{isDarkMode ? 'Mode Sombre Actif' : 'Mode Clair Actif'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className={`w-12 h-6 rounded-full transition-colors p-1 relative flex items-center ${
              isDarkMode ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Switch Notifications Push (Rappel 20h & Dimanche) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-blue-500" />
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 block">Rappels Automatiques</span>
              <span className="text-xs text-gray-400">Rappel 20h & Résumé du Dimanche</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleNotifications}
            className={`w-12 h-6 rounded-full transition-colors p-1 relative flex items-center ${
              notificationsEnabled ? 'bg-emerald-600 justify-end' : 'bg-gray-300 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* SECTION 3: CONFIGURATION SUPABASE */}
      <form onSubmit={handleSaveSupabaseConfig} className="bg-white dark:bg-gray-800/90 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Connexion Supabase Cloud
            </h3>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            supabaseStatus
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}>
            {supabaseStatus ? 'Connecté' : 'Mode Local'}
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">URL Projet Supabase</label>
          <input
            type="url"
            placeholder="https://xyz.supabase.co"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-gray-100 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Clé Anonyme (Anon Key)</label>
          <input
            type="password"
            placeholder="eyJhbGciOiJIUzI1Ni..."
            value={supabaseKey}
            onChange={(e) => setSupabaseKey(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-gray-100 focus:outline-none"
          />
        </div>

        <div className="flex space-x-2 pt-1">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Connecter Cloud
          </button>
          {supabaseStatus && (
            <button
              type="button"
              onClick={handleClearSupabaseConfig}
              className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition-all"
            >
              Déconnecter
            </button>
          )}
        </div>
      </form>

      {/* SECTION 4: EXPORTATION DES DONNÉES */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Exporter mes données
          </h3>
          <p className="text-xs text-gray-400">Télécharger au format CSV (Excel)</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

    </div>
  );
};
