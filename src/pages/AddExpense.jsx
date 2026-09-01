import React, { useState } from 'react';
import { CATEGORIES } from '../utils/categories';
import { VoiceInputModal } from '../components/VoiceInputModal';
import { PhotoCaptureModal } from '../components/PhotoCaptureModal';
import { uploadExpensePhoto } from '../services/supabaseClient';
import { Mic, Camera, Save, Calendar, FileText, Tag, Coins, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AddExpense = ({ onSaveExpense, onFinish }) => {
  const [description, setDescription] = useState('');
  const [montant, setMontant] = useState('');
  const [categorie, setCategorie] = useState('Nourriture');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Fichier photo sélectionné/compressé
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Modals & état de chargement
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Saisie vocale confirmée
  const handleConfirmVoiceData = (parsedData) => {
    if (parsedData.description) setDescription(parsedData.description);
    if (parsedData.montant) setMontant(parsedData.montant.toString());
    if (parsedData.categorie) setCategorie(parsedData.categorie);
  };

  // Photo sélectionnée & compressée
  const handlePhotoSelected = (file, previewUrl) => {
    setPhotoFile(file);
    setPhotoPreview(previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !montant || parseFloat(montant) <= 0) {
      return;
    }

    setIsLoading(true);

    try {
      let uploadedPhotoUrl = null;
      if (photoFile) {
        uploadedPhotoUrl = await uploadExpensePhoto(photoFile);
      }

      const expenseData = {
        description: description.trim(),
        montant: parseFloat(montant),
        categorie,
        date: new Date(date).toISOString(),
        photo_url: uploadedPhotoUrl
      };

      await onSaveExpense(expenseData);

      // Effet Confetti de succès
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });

      if (onFinish) onFinish();
    } catch (err) {
      console.error('Erreur sauvegarde dépense:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pb-24">
      
      {/* En-tête de section */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl p-5 text-white shadow-lg shadow-blue-500/20">
        <h2 className="text-xl font-bold flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-300 animate-spin" />
          <span>Ajouter une Dépense</span>
        </h2>
        <p className="text-xs text-blue-100 mt-1">
          Saisissez manuellement ou utilisez l'IA vocale en arabe tunisien.
        </p>
      </div>

      {/* Boutons d'Accès Rapide : Vocal & Photo */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setShowVoiceModal(true)}
          className="flex items-center justify-center space-x-2 p-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition-all text-xs font-bold"
        >
          <Mic className="w-4 h-4 animate-pulse" />
          <span>🎤 Saisie Vocale</span>
        </button>

        <button
          type="button"
          onClick={() => setShowPhotoModal(true)}
          className="flex items-center justify-center space-x-2 p-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition-all text-xs font-bold"
        >
          <Camera className="w-4 h-4" />
          <span>📸 Prendre Photo</span>
        </button>
      </div>

      {/* Previsualisation de la photo si attachée */}
      {photoPreview && (
        <div className="relative rounded-2xl overflow-hidden border border-emerald-300 dark:border-emerald-700 bg-gray-900 p-2 flex items-center space-x-3">
          <img src={photoPreview} alt="Aperçu facture" className="w-16 h-16 object-cover rounded-xl shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-emerald-400 block">Facture attachée !</span>
            <span className="text-[10px] text-gray-400 block truncate">Image compressée prête pour upload</span>
          </div>
          <button
            type="button"
            onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 bg-red-950/40 rounded-lg"
          >
            Retirer
          </button>
        </div>
      )}

      {/* Formulaire Principal */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800/90 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        
        {/* Champ Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Description</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Course taxi, Achat fruits, Café..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Champ Montant en TND */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center space-x-1.5">
            <Coins className="w-4 h-4 text-emerald-500" />
            <span>Montant (en Dinars Tunisiens TND)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.100"
              min="0.100"
              required
              placeholder="0.000"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full px-4 py-3 pr-16 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-base font-extrabold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
              TND
            </span>
          </div>
        </div>

        {/* Menu Déroulant Catégorie */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center space-x-1.5">
            <Tag className="w-4 h-4 text-purple-500" />
            <span>Catégorie</span>
          </label>
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Champ Date */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Date de la Dépense</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Bouton Sauvegarder */}
        <button
          type="submit"
          disabled={isLoading || !description || !montant}
          className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white text-base font-extrabold rounded-2xl shadow-xl shadow-blue-500/30 hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sauvegarde Supabase en cours...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>💾 Enregistrer la Dépense</span>
            </>
          )}
        </button>

      </form>

      {/* Modals Saisie Vocale & Photo */}
      <VoiceInputModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onConfirmVoiceData={handleConfirmVoiceData}
      />

      <PhotoCaptureModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onPhotoSelected={handlePhotoSelected}
      />

    </div>
  );
};
