import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, Sparkles, AlertCircle, CheckCircle2, Zap, ShieldCheck, HelpCircle } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/supabaseClient';

export const AuthPage = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [showGoogleGuide, setShowGoogleGuide] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Auth Error:', err);
      setShowGoogleGuide(true);
      setErrorMsg('Google OAuth n\'est pas encore activé sur votre console Supabase. Utilisez le bouton "Connexion Démo 1-Click" ou l\'E-mail ci-dessous.');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        const data = await signUpWithEmail(email, password);
        if (data?.user) {
          setInfoMsg('Compte créé avec succès ! Connectez-vous avec vos identifiants.');
          setIsSignUp(false);
          if (onAuthSuccess) onAuthSuccess(data.user);
        }
      } else {
        const data = await signInWithEmail(email, password);
        if (data?.user) {
          if (onAuthSuccess) onAuthSuccess(data.user);
        }
      }
    } catch (err) {
      console.error(err);
      if (err.message?.includes('Invalid login credentials')) {
        setErrorMsg('Identifiants incorrects. Pour créer votre compte Supabase, cliquez sur "S\'inscrire".');
      } else {
        setErrorMsg(err.message || 'Échec de l\'authentification Supabase');
      }
    } finally {
      setLoading(false);
    }
  };

  // Connexion instantanée avec un compte démo dédié sur Supabase
  const handleQuickDemoAuth = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    const demoEmail = 'user.demo@depenses.tn';
    const demoPass = 'Password123!';

    try {
      let data = await signInWithEmail(demoEmail, demoPass).catch(() => null);
      
      if (!data?.user) {
        data = await signUpWithEmail(demoEmail, demoPass);
      }

      if (data?.user) {
        if (onAuthSuccess) onAuthSuccess(data.user);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erreur création compte démo : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[32px] p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-5">
        
        {/* En-tête de bienvenue */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mx-auto animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
            💰 Mes Dépenses
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto">
            Authentification Supabase Obligatoire (Chaque utilisateur consulte et enregistre uniquement ses propres données).
          </p>
        </div>

        {/* Badge d'isolation Supabase RLS */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300 font-semibold">
          <ShieldCheck className="w-4 h-4 shrink-0 text-blue-500" />
          <span>Données sécurisées et isolées par Supabase RLS</span>
        </div>

        {/* BOUTON RECOMMANDÉ : 1-Click Connexion Démo Instantanée */}
        <button
          type="button"
          onClick={handleQuickDemoAuth}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
        >
          <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>🚀 Connexion 1-Click Démo (`user.demo@depenses.tn`)</span>
        </button>

        {/* Bouton Connexion Google / Gmail */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-center space-x-3 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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

        {/* Message d'explication si Google Provider non activé dans la console Supabase */}
        {showGoogleGuide && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
            <div className="font-bold flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Pourquoi l'erreur Google OAuth 400 s'affiche-t-elle ?</span>
            </div>
            <p>
              Supabase requiert que le fournisseur Google soit activé dans le tableau de bord Supabase : <br/>
              <strong>Console Supabase ➔ Authentication ➔ Providers ➔ Google ➔ Enable Provider</strong>.
            </p>
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
              💡 Solution instantanée sans configuration : Utilisez le bouton "🚀 Connexion 1-Click Démo" ou inscrivez-vous avec votre email ci-dessous !
            </p>
          </div>
        )}

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
          <span className="flex-shrink mx-3 text-[10px] font-bold text-gray-400 uppercase">ou e-mail Supabase</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-start space-x-2 text-xs text-red-600 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start space-x-2 text-xs text-emerald-600 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Formulaire Email */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Adresse E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="votre.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-1.5"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isSignUp ? 'S\'inscrire sur Supabase' : 'Se Connecter'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setInfoMsg(''); }}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? S\'inscrire ici'}
          </button>
        </div>

      </div>
    </div>
  );
};
