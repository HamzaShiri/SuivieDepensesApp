import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Check, Volume2, Sparkles, AlertCircle, Languages } from 'lucide-react';
import { createSpeechRecognizer, parseHybridVoiceInput } from '../services/voiceParser';
import { formatTND } from '../utils/currency';

export const VoiceInputModal = ({ isOpen, onClose, onConfirmVoiceData }) => {
  const [lang, setLang] = useState('ar-TN'); // 'ar-TN' ou 'fr-FR'
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [recognizer, setRecognizer] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Exemples hybrides en Français et Arabe Tunisien
  const samplePhrases = {
    'ar-TN': [
      'شريت خبز بثلاثة دنانير',
      'شريت un café بدينارين',
      'تاكسي بخمسة دنانير',
      'دواء من الفرماسي بخمسة وعشرين دينار'
    ],
    'fr-FR': [
      'J\'ai acheté du pain pour 3 dinars',
      'Café pour 2.5 dinars',
      'Course de taxi 5 dinars',
      'Facture STEG à 85 dinars'
    ]
  };

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setParsedResult(null);
      setErrorMsg('');
      startListeningProcess();
    } else {
      stopListening();
    }
  }, [isOpen, lang]);

  const startListeningProcess = () => {
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
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        if (err === 'not-allowed') {
          setErrorMsg('Permission du micro refusée. Utilisez les exemples ci-dessous.');
        } else {
          setErrorMsg(`Signal vocal non détecté en ${lang === 'fr-FR' ? 'Français' : 'Arabe'}. Utilisez les exemples ci-dessous.`);
        }
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (rec) {
      setRecognizer(rec);
      try {
        rec.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    } else {
      setErrorMsg('Le navigateur ne supporte pas l\'API Web Speech standard. Utilisez nos exemples pour tester le parser hybride !');
    }
  };

  const stopListening = () => {
    if (recognizer) {
      try {
        recognizer.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const handleTestPhraseSelect = (phrase) => {
    setTranscript(phrase);
    const parsed = parseHybridVoiceInput(phrase);
    setParsedResult(parsed);
  };

  const handleConfirm = () => {
    if (parsedResult) {
      onConfirmVoiceData(parsedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Saisie Vocale Multilingue
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sélecteur de Langue : Français / Arabe Tunisien */}
        <div className="flex items-center justify-center space-x-1.5 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setLang('ar-TN')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
              lang === 'ar-TN'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <span>🇹🇳 Arabe Tunisien (ar-TN)</span>
          </button>
          <button
            type="button"
            onClick={() => setLang('fr-FR')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
              lang === 'fr-FR'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <span>🇫🇷 Français (fr-FR)</span>
          </button>
        </div>

        {/* Zone du Microphone */}
        <div className="my-4 flex flex-col items-center justify-center">
          <button
            onClick={isListening ? stopListening : startListeningProcess}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-red-500 text-white shadow-xl shadow-red-500/40 animate-pulse scale-105'
                : 'bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/30 hover:scale-105'
            }`}
          >
            {isListening ? <Mic className="w-9 h-9 animate-bounce" /> : <MicOff className="w-9 h-9" />}
            {isListening && (
              <span className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-75"></span>
            )}
          </button>

          <p className="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            {isListening
              ? `Écoute en ${lang === 'fr-FR' ? 'Français' : 'Arabe Tunisien'} (Accepte les termes mixtes)...`
              : 'Cliquez sur le micro pour parler'}
          </p>
        </div>

        {/* Message d'erreur */}
        {errorMsg && (
          <div className="mb-3 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start space-x-2 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Transcripteur & Parser */}
        {transcript && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-[11px] font-semibold text-gray-400 mb-1 flex items-center space-x-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Texte reconnu (Hybride) :</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
              "{transcript}"
            </p>

            {parsedResult && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[9px] text-gray-400 font-semibold block">Description</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate block">
                    {parsedResult.description}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[9px] text-gray-400 font-semibold block">Montant</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                    {formatTND(parsedResult.montant)}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[9px] text-gray-400 font-semibold block">Catégorie</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                    {parsedResult.categorie}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Exemples rapides selon la langue active */}
        <div className="mb-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
            💡 Exemples d'essai ({lang === 'fr-FR' ? 'Français' : 'Arabe Tunisien'}) :
          </span>
          <div className="flex flex-wrap gap-1">
            {samplePhrases[lang].map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => handleTestPhraseSelect(phrase)}
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
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-2xl"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!parsedResult}
            className="flex-1 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl shadow-md disabled:opacity-50 flex items-center justify-center space-x-1"
          >
            <Check className="w-4 h-4" />
            <span>Valider</span>
          </button>
        </div>

      </div>
    </div>
  );
};
