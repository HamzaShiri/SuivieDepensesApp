import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured, setMonthlyBudget, signOutUser, testSupabaseDatabaseConnection } from '../services/supabaseClient';
import { requestNotificationPermission } from '../services/notificationService';
import { Settings as SettingsIcon, Moon, Sun, Bell, Database, Wallet, Download, User, LogOut, LogIn, ShieldCheck, KeyRound, Activity, CheckCircle2 } from 'lucide-react';
import { OTPKeypadModal } from '../components/OTPKeypadModal';

export const Settings = ({
  monthlyBudget,
  onUpdateBudget,
  isDarkMode,
  onToggleTheme,
  currentUser,
  onShowToast
}) => {
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('notifications_enabled') !== 'false'
  );
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('supabase_key') || '');
  const [supabaseStatus, setSupabaseStatus] = useState(isSupabaseConfigured());
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [showChangePINModal, setShowChangePINModal] = useState(false);

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

  const handleSignOut = async () => {
    await signOutUser();
    onShowToast('Déconnecté de votre session Supabase', 'success');
    window.location.reload();
  };

  // Test de diagnostic Supabase RLS
  const handleTestDatabase = async () => {
    setIsTestingSupabase(true);
    const res = await testSupabaseDatabaseConnection();
    setIsTestingSupabase(false);

    if (res.success) {
      onShowToast(`✅ ${res.message}`, 'success');
    } else {
      onShowToast(`⚠️ ${res.message}`, 'error');
    }
  };

  const handleSavePINSuccess = (newPin) => {
    if (currentUser) {
      localStorage.setItem(`otp_pin_${currentUser.id}`, newPin);
      onShowToast('Nouveau Code PIN OTP enregistré avec succès ! 🔒', 'success');
    }
    setShowChangePINModal(false);
  };

  const handleSaveSupabaseConfig = (e) => {
    e.preventDefault();
    if (supabaseUrl && supabaseKey) {
      localStorage.setItem('supabase_url', supabaseUrl.trim());
      localStorage.setItem('supabase_key', supabaseKey.trim());
      setSupabaseStatus(true);
      onShowToast('Connexion Supabase configurée avec succès !', 'success');
      window.location.reload();
    }
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
      
      {/* Modal Changement Code PIN */}
      <OTPKeypadModal
        isOpen={showChangePINModal}
        mode="create"
        userEmail={currentUser?.email}
        onSuccess={handleSavePINSuccess}
        onClose={() => setShowChangePINModal(false)}
      />

      {/* SECTION COMPTE UTILISATEUR GMAIL */}
      <div className="bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-5 text-white shadow-lg shadow-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg border border-white/30">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-xs text-blue-200 font-semibold block">Compte Utilisateur Supabase</span>
              <h3 className="text-sm font-bold truncate max-w-[180px]">
                {currentUser ? currentUser.email : 'Invité (Non connecté)'}
              </h3>
            </div>
          </div>

          {currentUser && (
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-red-500/80 hover:bg-red-600 backdrop-blur-md text-white font-bold text-xs rounded-xl flex items-center space-x-1 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION SÉCURITÉ CODE PIN OTP */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Code PIN OTP de Sécurité
            </h3>
            <p className="text-xs text-gray-400">Protege vos dépenses par un code 4 chiffres</p>
          </div>
        </div>

        <button
          onClick={() => setShowChangePINModal(true)}
          className="px-3 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all"
        >
          Modifier PIN
        </button>
      </div>

      {/* SECTION DIAGNOSTIC SUPABASE CLOUD */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Diagnostic Supabase Cloud
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-300">
            RLS Active
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Vérifiez l'accès direct et l'autorisation d'écriture dans la table "depenses" de votre Supabase.
        </p>

        <button
          onClick={handleTestDatabase}
          disabled={isTestingSupabase}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
        >
          <Activity className="w-4 h-4 animate-spin" />
          <span>🧪 Test Connexion & Table "depenses"</span>
        </button>
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
          Préférences
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 block">Thème Visuel</span>
              <span className="text-xs text-gray-400">{isDarkMode ? 'Mode Sombre' : 'Mode Clair'}</span>
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-blue-500" />
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 block">Rappels Automatiques</span>
              <span className="text-xs text-gray-400">20h & Dimanche</span>
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

      {/* EXPORTATION */}
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
