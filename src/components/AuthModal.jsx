import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/supabaseClient';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
      // Redirection automatique via OAuth
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de la connexion avec Google');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        const data = await signUpWithEmail(email, password);
        if (onAuthSuccess) onAuthSuccess(data?.user);
      } else {
        const data = await signInWithEmail(email, password);
        if (onAuthSuccess) onAuthSuccess(data?.user);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Échec de l\'authentification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {isSignUp ? 'Créer un Compte' : 'Connexion'}
              </h3>
              <p className="text-xs text-gray-400">Synchronisez vos dépenses Supabase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bouton Gmail / Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-4 mb-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-200 font-bold text-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center space-x-3 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
        >
          {/* Logo SVG Google officiel */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuer avec Google / Gmail</span>
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
          <span className="flex-shrink mx-3 text-[11px] font-bold text-gray-400 uppercase">ou e-mail</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-start space-x-2 text-xs text-red-600 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulaire Email */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Adresse E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="votre.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-gray-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-gray-100 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isSignUp ? 'Créer mon Compte' : 'Se Connecter'}</span>
          </button>
        </form>

        {/* Switch Inscription / Connexion */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
          </button>
        </div>

      </div>
    </div>
  );
};
