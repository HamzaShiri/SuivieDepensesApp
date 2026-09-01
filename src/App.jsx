import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { NavigationBar } from './components/NavigationBar';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';

import { Dashboard } from './pages/Dashboard';
import { AddExpense } from './pages/AddExpense';
import { ExpenseList } from './pages/ExpenseList';
import { Statistics } from './pages/Statistics';
import { Settings } from './pages/Settings';

import {
  getExpenses,
  addExpense,
  deleteExpense,
  getMonthlyBudget,
  setMonthlyBudget,
  getCurrentUser,
  onAuthStateChange
} from './services/supabaseClient';
import { initScheduledNotificationTriggers } from './services/notificationService';
import { calculateMonthlyTotal } from './utils/dates';
import { Smartphone, Monitor } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [monthlyBudget, setMonthlyBudgetState] = useState(getMonthlyBudget());
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  useEffect(() => {
    loadData();
    initScheduledNotificationTriggers();

    // Écouteur de session Supabase Auth
    getCurrentUser().then(user => setCurrentUser(user));
    const { data: authListener } = onAuthStateChange((event, user) => {
      setCurrentUser(user);
      if (user) {
        setToast({ message: `Connecté sur Supabase : ${user.email} ☁️`, type: 'success' });
        loadData();
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const loadData = async () => {
    const data = await getExpenses();
    setExpenses(data);
  };

  const handleSaveExpense = async (expenseData) => {
    const result = await addExpense(expenseData);
    await loadData();

    if (result?.cloud) {
      setToast({ message: 'Dépense enregistrée dans votre Supabase Cloud ! ☁️', type: 'success' });
    } else {
      setToast({ message: 'Dépense enregistrée dans l\'application (mode local) 📱', type: 'success' });
    }

    setActiveTab('dashboard');
  };

  const handleDeleteExpense = async (id) => {
    await deleteExpense(id);
    await loadData();
    setToast({ message: 'Dépense supprimée', type: 'success' });
  };

  const handleUpdateBudget = (newBudget) => {
    setMonthlyBudget(newBudget);
    setMonthlyBudgetState(newBudget);
  };

  const showToastMsg = (msg, type = 'success') => {
    setToast({ message: msg, type });
  };

  const monthlyTotal = calculateMonthlyTotal(expenses);

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-950 font-sans transition-colors duration-300 ${isMobileFrame ? 'flex items-center justify-center p-4' : ''}`}>
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Modal Authentification Gmail / Google */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setToast({ message: 'Connexion Supabase réussie ! ☁️', type: 'success' });
        }}
      />

      {/* Toggler cadre mobile / Plein écran */}
      <div className="fixed top-3 right-3 z-50 hidden md:flex items-center space-x-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm text-xs font-semibold text-gray-600 dark:text-gray-300">
        <button
          onClick={() => setIsMobileFrame(false)}
          className={`p-1 rounded-lg ${!isMobileFrame ? 'bg-blue-600 text-white' : ''}`}
          title="Plein Écran Responsive"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsMobileFrame(true)}
          className={`p-1 rounded-lg ${isMobileFrame ? 'bg-blue-600 text-white' : ''}`}
          title="Vue Cadre Smartphone Mobile"
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>

      {/* Frame Container Mobile */}
      <div className={`w-full bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col relative transition-all ${
        isMobileFrame
          ? 'max-w-md h-[844px] min-h-[844px] rounded-[40px] shadow-2xl border-[8px] border-gray-800 dark:border-gray-800 overflow-y-auto no-scrollbar my-auto'
          : 'max-w-md mx-auto shadow-md'
      }`}>

        {/* Header (Top) */}
        <Header
          title="💰 Mes Dépenses"
          monthlyTotal={monthlyTotal}
          monthlyBudget={monthlyBudget}
          currentUser={currentUser}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenSettings={() => setActiveTab('settings')}
        />

        {/* Zone de Contenu Réactif */}
        <main className="flex-1 px-4 pt-4">
          {activeTab === 'dashboard' && (
            <Dashboard
              expenses={expenses}
              monthlyBudget={monthlyBudget}
              onNavigate={setActiveTab}
              onDeleteExpense={handleDeleteExpense}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'add' && (
            <AddExpense
              onSaveExpense={handleSaveExpense}
              onFinish={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'list' && (
            <ExpenseList
              expenses={expenses}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'stats' && (
            <Statistics
              expenses={expenses}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              monthlyBudget={monthlyBudget}
              onUpdateBudget={handleUpdateBudget}
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
              currentUser={currentUser}
              onOpenAuth={() => setShowAuthModal(true)}
              onShowToast={showToastMsg}
            />
          )}
        </main>

        {/* Navigation Bar (Bottom) */}
        <NavigationBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={() => setActiveTab('add')}
        />

      </div>
    </div>
  );
}

export default App;
