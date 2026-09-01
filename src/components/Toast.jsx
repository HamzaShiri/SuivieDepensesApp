import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-xs w-full px-4 animate-in slide-in-from-top-4 fade-in duration-300">
      <div
        className={`flex items-center justify-between p-3.5 rounded-2xl shadow-xl border backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-900/90 text-white border-emerald-700 shadow-emerald-900/20'
            : 'bg-red-900/90 text-white border-red-700 shadow-red-900/20'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{message}</span>
        </div>
        <button onClick={onClose} className="p-1 text-white/70 hover:text-white rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
