import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Delete, Sparkles, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export const OTPKeypadModal = ({
  isOpen,
  mode = 'verify', // 'verify' (déverrouillage) ou 'create' (création)
  savedOTP = '',
  userEmail = '',
  onSuccess,
  onClose
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // 1 = Enter PIN, 2 = Confirm PIN (mode create)
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setConfirmPin('');
      setStep(1);
      setErrorMsg('');
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      try { navigator.vibrate(40); } catch (e) {}
    }
  };

  const handleKeyPress = (digit) => {
    triggerHaptic();
    setErrorMsg('');

    if (mode === 'verify') {
      if (pin.length < 4) {
        const nextPin = pin + digit;
        setPin(nextPin);
        if (nextPin.length === 4) {
          evaluateVerifyPin(nextPin);
        }
      }
    } else {
      // Mode 'create'
      if (step === 1) {
        if (pin.length < 4) {
          const nextPin = pin + digit;
          setPin(nextPin);
          if (nextPin.length === 4) {
            setTimeout(() => {
              setStep(2);
            }, 200);
          }
        }
      } else {
        if (confirmPin.length < 4) {
          const nextConfirm = confirmPin + digit;
          setConfirmPin(nextConfirm);
          if (nextConfirm.length === 4) {
            evaluateCreatePin(nextConfirm);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    triggerHaptic();
    setErrorMsg('');
    if (mode === 'verify') {
      setPin(prev => prev.slice(0, -1));
    } else {
      if (step === 1) {
        setPin(prev => prev.slice(0, -1));
      } else {
        setConfirmPin(prev => prev.slice(0, -1));
      }
    }
  };

  const evaluateVerifyPin = (enteredPin) => {
    if (enteredPin === savedOTP) {
      if (onSuccess) onSuccess(enteredPin);
    } else {
      setErrorMsg('Code PIN incorrect. Veuillez réessayer.');
      setTimeout(() => {
        setPin('');
      }, 500);
    }
  };

  const evaluateCreatePin = (enteredConfirm) => {
    if (pin === enteredConfirm) {
      if (onSuccess) onSuccess(pin);
    } else {
      setErrorMsg('Les deux codes PIN ne correspondent pas. Recommencez.');
      setTimeout(() => {
        setPin('');
        setConfirmPin('');
        setStep(1);
      }, 600);
    }
  };

  const activePinLength = mode === 'verify' ? pin.length : (step === 1 ? pin.length : confirmPin.length);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="relative max-w-sm w-full bg-white dark:bg-gray-900 rounded-[36px] p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6 text-center animate-in fade-in zoom-in duration-200">
        
        {/* En-tête de sécurité */}
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 mx-auto animate-bounce">
            <KeyRound className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
            {mode === 'verify' ? 'Code PIN OTP Requis' : (step === 1 ? 'Créer votre Code PIN' : 'Confirmer le Code PIN')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto">
            {mode === 'verify'
              ? `Entrez votre code à 4 chiffres pour déverrouiller ${userEmail || 'vos dépenses'}`
              : (step === 1 ? 'Choisissez un code secret à 4 chiffres' : 'Tapez de nouveau votre code pour confirmer')}
          </p>
        </div>

        {/* Indicateurs visuels des 4 chiffres du PIN */}
        <div className="flex items-center justify-center space-x-4 my-4">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < activePinLength;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-300 transform ${
                  isFilled
                    ? 'bg-gradient-to-r from-blue-600 to-emerald-500 scale-125 shadow-md shadow-blue-500/40'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            );
          })}
        </div>

        {/* Message d'erreur */}
        {errorMsg && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center justify-center space-x-1.5 text-xs font-bold text-red-600 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Clavier numérique 0-9 */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num.toString())}
              className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-500 border border-gray-200 dark:border-gray-700 text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center shadow-xs active:scale-90 transition-all"
            >
              {num}
            </button>
          ))}

          {/* Bouton Annuler / Effacer */}
          <div className="w-16 h-16 flex items-center justify-center">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Fermer
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-500 border border-gray-200 dark:border-gray-700 text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center shadow-xs active:scale-90 transition-all"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-600 dark:text-gray-300 flex items-center justify-center border border-gray-200 dark:border-gray-700 active:scale-90 transition-all"
            title="Effacer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
