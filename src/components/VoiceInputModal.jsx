import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Check, Volume2, Clock, Sparkles, Edit3, Save, Zap } from 'lucide-react';
import { createSpeechRecognizer, parseHybridVoiceInput } from '../services/voiceParser';
import { formatTND } from '../utils/currency';

export const VoiceInputModal = ({ isOpen, onClose, onConfirmVoiceData, onDirectSaveExpense }) => {
  const [lang, setLang] = useState('ar-TN'); // 'ar-TN' ou 'fr-FR'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Exemples hybrides cliquables
  const samplePhrases = [
    'Salam, je veux commander un كسكسي, s\'il vous plaît',
    'شريت un café بدينارين',
    'J\'ai acheté 2 baguettes et 100g de زبدة à 3.5 dinars',
    'Course de taxi بخمسة دنانير',
    'Facture STEG à 85 dinars'
  ];

  useEffect(() => {
    if (isOpen) {
      resetState();
    } else {
      stopRecording();
    }
  }, [isOpen]);

  const resetState = () => {
    stopRecording();
    setTranscript('');
    setParsedResult(null);
    setErrorMsg('');
    setRecordingSeconds(0);
  };

  const handleSwitchLanguage = (newLang) => {
    if (isRecording) {
      stopRecording();
    }
    setLang(newLang);
    setErrorMsg('');
  };

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      try { navigator.vibrate(50); } catch (e) {}
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // DÉMARRAGE DE LA RECONNAISSANCE VOCALE (1er Clic)
  const startRecording = () => {
    triggerHaptic();
    setErrorMsg('');
    setTranscript('');
    setParsedResult(null);

    // Annuler tout enregistrement précédent en cours
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    const rec = createSpeechRecognizer({
      lang,
      onResult: (text, isFinal) => {
        if (text) {
          setTranscript(text);
          const parsed = parseHybridVoiceInput(text);
          setParsedResult(parsed);
        }
      },
      onError: (err) => {
        console.warn('Erreur SpeechRecognition:', err);
        setIsRecording(false);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        if (err === 'not-allowed') {
          setErrorMsg('Permission micro refusée dans le navigateur.');
        } else if (err === 'no-speech') {
          setErrorMsg('Aucune voix détectée. Parlez en face du micro.');
        } else {
          setErrorMsg(`Micro indisponible en ${lang === 'fr-FR' ? 'Français' : 'Arabe'}. Vous pouvez saisir directement ci-dessous.`);
        }
      },
      onEnd: () => {
        setIsRecording(false);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      }
    });

    if (!rec) {
      setErrorMsg('L\'API Web Speech n\'est pas disponible sur ce navigateur. Utilisez les exemples ou la saisie.');
      return;
    }

    try {
      recognitionRef.current = rec;
      rec.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      // Chronomètre
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Erreur start rec:', err);
      setIsRecording(false);
    }
  };

  // ARRÊT DE LA RECONNAISSANCE VOCALE (2ème Clic)
  const stopRecording = () => {
    triggerHaptic();

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    setIsRecording(false);
  };

  const handleToggleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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

  const handleDirectSave = async () => {
    if (parsedResult && onDirectSaveExpense) {
      await onDirectSaveExpense({
        description: parsedResult.description,
        montant: parsedResult.montant,
        categorie: parsedResult.categorie,
        date: new Date().toISOString()
      });
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
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Saisie Vocale Multilingue
              </h3>
              <p className="text-[11px] text-gray-400">Arabe Tunisien (`ar-TN`) et Français (`fr-FR`)</p>
            </div>
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
            onClick={() => handleSwitchLanguage('ar-TN')}
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
            onClick={() => handleSwitchLanguage('fr-FR')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all ${
              lang === 'fr-FR'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            🇫🇷 Français (fr-FR)
          </button>
        </div>

        {/* BOUTON TOGGLE MICRO (1er clic = Démarrer, 2ème clic = Arrêter) */}
        <div className="my-3 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleToggleClick}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
              isRecording
                ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-xl shadow-red-500/40 scale-105 ring-4 ring-red-300 dark:ring-red-900'
                : 'bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30 hover:scale-105'
            }`}
          >
            {isRecording ? (
              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="w-5 h-5 bg-white rounded-sm animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">ARRÊTER</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-1">
                <Mic className="w-9 h-9" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">PARLER ({lang === 'fr-FR' ? 'FR' : 'AR'})</span>
              </div>
            )}

            {isRecording && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white animate-ping" />
            )}
          </button>

          <div className="mt-2 text-center">
            {isRecording ? (
              <div className="flex items-center justify-center space-x-2 text-red-600 dark:text-red-400 font-bold text-xs animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>Enregistrement ({lang === 'fr-FR' ? 'Français' : 'Arabe'})... ({formatTimer(recordingSeconds)})</span>
              </div>
            ) : (
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                Cliquez 1 fois pour parler, ré-appuyez pour terminer
              </span>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center space-x-2 text-xs text-amber-700 dark:text-amber-300">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* CHAMP DE TEXTE RECONNU */}
        <div className="mb-3">
          <label className="block text-[11px] font-semibold text-gray-400 mb-1 flex items-center space-x-1">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Texte reconnu (Modifiable en direct) :</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Salam, je veux commander un كسكسي, s'il vous plaît..."
            value={transcript}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* PRÉVISUALISATION DE L'ANALYSE IA */}
        {parsedResult && (
          <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              ✨ Données extraites de votre voix :
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

        {/* EXEMPLES CLIQUABLES */}
        <div className="mb-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            💡 Essayer avec des phrases d'exemples :
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

        {/* ACTIONS */}
        <div className="space-y-2">
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
              className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-md disabled:opacity-50 flex items-center justify-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>Injecter dans le Formulaire</span>
            </button>
          </div>

          {parsedResult && onDirectSaveExpense && (
            <button
              type="button"
              onClick={handleDirectSave}
              className="w-full py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl shadow-lg flex items-center justify-center space-x-1"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>⚡ Enregistrer Directement dans Supabase</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
