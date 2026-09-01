import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Check, Volume2, Sparkles, AlertCircle, RefreshCw, Edit3 } from 'lucide-react';
import { createSpeechRecognizer, parseHybridVoiceInput } from '../services/voiceParser';
import { formatTND } from '../utils/currency';

export const VoiceInputModal = ({ isOpen, onClose, onConfirmVoiceData }) => {
  const [lang, setLang] = useState('ar-TN'); // 'ar-TN' ou 'fr-FR'
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef(null);

  // Exemples hybrides Franco-Arabes prêts à être cliqués
  const samplePhrases = [
    'شريت un café بدينارين',
    'J\'ai acheté du pain pour 3 dinars',
    'تاكسي بخمسة دنانير',
    'Course taxi 5 dinars',
    'دواء من الفرماسي بخمسة وعشرين دينار',
    'Facture STEG à 85 dinars'
  ];

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setParsedResult(null);
      setErrorMsg('');
      setIsListening(false);
    } else {
      stopListening();
    }
  }, [isOpen]);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignorer les erreurs d'arrêt
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      return;
    }

    setErrorMsg('');
    stopListening();

    const rec = createSpeechRecognizer({
      lang,
      onResult: (text, isFinal) => {
        setTranscript(text);
        if (text) {
          const parsed = parseHybridVoiceInput(text);
          setParsedResult(parsed);
        }
      },
      onError: (err) => {
        console.warn('Erreur SpeechRecognition:', err);
        setIsListening(false);
        if (err === 'not-allowed' || err === 'permission-denied') {
          setErrorMsg('Permission micro refusée. Saisissez votre texte ci-dessous ou cliquez sur un exemple.');
        } else if (err === 'no-speech') {
          setErrorMsg('Aucune voix détectée. Veuillez réessayer en parlant bien en face du micro.');
        } else {
          setErrorMsg('Le micro n\'a pas pu démarrer. Utilisez la saisie directe ou nos exemples.');
        }
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (!rec) {
      setErrorMsg('L\'API Web Speech n\'est pas disponible sur ce navigateur. Vous pouvez saisir votre phrase ci-dessous !');
      return;
    }

    try {
      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Erreur au démarrage du micro:', err);
      setIsListening(false);
      setErrorMsg('Impossible d\'activer le micro. Utilisez la saisie manuelle ci-dessous.');
    }
  };

  const handleTextChange = (text) => {
    setTranscript(text);
    if (text.trim()) {
      const parsed = parseHybridVoiceInput(text);
      setParsedResult(parsed);
    } else {
      setParsedResult(null);
    }
  };

  const handleConfirm = () => {
    if (parsedResult) {
      onConfirmVoiceData(parsedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Saisie Vocale (Français & Arabe)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sélecteur de Langue */}
        <div className="flex items-center justify-center space-x-1.5 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setLang('ar-TN')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all ${
              lang === 'ar-TN'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            🇹🇳 Arabe Tunisien (ar-TN)
          </button>
          <button
            type="button"
            onClick={() => setLang('fr-FR')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all ${
              lang === 'fr-FR'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            🇫🇷 Français (fr-FR)
          </button>
        </div>

        {/* Bouton du Microphone */}
        <div className="my-3 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleMicClick}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-red-500 text-white shadow-xl shadow-red-500/40 animate-pulse scale-105'
                : 'bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95'
            }`}
          >
            {isListening ? <Mic className="w-9 h-9 animate-bounce" /> : <MicOff className="w-9 h-9" />}
            {isListening && (
              <span className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-75"></span>
            )}
          </button>

          <p className="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            {isListening
              ? `🎙️ Écoute active en ${lang === 'fr-FR' ? 'Français' : 'Arabe Tunisien'}...`
              : 'Appuyez pour parler'}
          </p>
        </div>

        {/* Message d'erreur */}
        {errorMsg && (
          <div className="mb-3 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start space-x-2 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Champ d'Édition / Texte Reconnu */}
        <div className="mb-3">
          <label className="block text-[11px] font-semibold text-gray-400 mb-1 flex items-center space-x-1">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Texte vocal ou mixte (Modifiable en direct) :</span>
          </label>
          <input
            type="text"
            placeholder="Ex: شريت un café بدينارين ou J'ai acheté du pain pour 3 dinars..."
            value={transcript}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Prévisualisation de l'Analyse Hybride */}
        {parsedResult && (
          <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1.5">
              ✨ Analyse IA Hybride (Franco-Arabe) :
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <span className="text-[9px] text-gray-400 font-semibold block">Description</span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate block">
                  {parsedResult.description}
                </span>
              </div>
              <div className="bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <span className="text-[9px] text-gray-400 font-semibold block">Montant</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                  {formatTND(parsedResult.montant)}
                </span>
              </div>
              <div className="bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <span className="text-[9px] text-gray-400 font-semibold block">Catégorie</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                  {parsedResult.categorie}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Phrases Exemples Franco-Arabes */}
        <div className="mb-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
            💡 Tester directement avec des phrases mixtes :
          </span>
          <div className="flex flex-wrap gap-1">
            {samplePhrases.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTextChange(phrase)}
                className="px-2 py-1 text-[11px] rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-medium transition-colors"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-2xl"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!parsedResult}
            className="flex-1 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 rounded-2xl shadow-md disabled:opacity-50 flex items-center justify-center space-x-1"
          >
            <Check className="w-4 h-4" />
            <span>Valider & Injecter</span>
          </button>
        </div>

      </div>
    </div>
  );
};
