import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { compressImage } from '../services/imageCompressor';

export const PhotoCaptureModal = ({ isOpen, onClose, onPhotoSelected }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [stats, setStats] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const originalSizeKb = (file.size / 1024).toFixed(1);

    try {
      // Compression via Canvas
      const compressed = await compressImage(file);
      const compressedSizeKb = (compressed.size / 1024).toFixed(1);
      const reduction = Math.round((1 - compressed.size / file.size) * 100);

      const url = URL.createObjectURL(compressed);
      setPreviewUrl(url);
      setCompressedFile(compressed);
      setStats({
        original: `${originalSizeKb} KB`,
        compressed: `${compressedSizeKb} KB`,
        reduction: `${reduction}%`
      });
    } catch (err) {
      console.error('Erreur compression image:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleConfirm = () => {
    if (compressedFile) {
      onPhotoSelected(compressedFile, previewUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Prendre / Joindre une Photo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input fichier caché */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Zone de prévisualisation ou d'upload */}
        <div className="my-4">
          {previewUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-900">
              <img
                src={previewUrl}
                alt="Facture"
                className="w-full h-56 object-contain"
              />
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  setCompressedFile(null);
                  setStats(null);
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full backdrop-blur-md transition-colors"
                title="Changer de photo"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-52 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all p-4 group"
            >
              {isCompressing ? (
                <div className="flex flex-col items-center space-y-2 text-emerald-600">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-semibold">Compression Canvas en cours...</span>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Ouvrir l'appareil photo ou la galerie
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Format recommandé: JPG, PNG (Auto-compressé)
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Statistiques de compression */}
        {stats && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Image Optimisée</span>
            </div>
            <div>
              <span className="line-through text-gray-400 mr-1.5">{stats.original}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.compressed} (-{stats.reduction})</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-2xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!compressedFile}
            className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 rounded-2xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center space-x-1"
          >
            <Check className="w-4 h-4" />
            <span>Attacher</span>
          </button>
        </div>

      </div>
    </div>
  );
};
