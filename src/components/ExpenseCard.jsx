import React, { useState } from 'react';
import { getCategoryById } from '../utils/categories';
import { formatTND } from '../utils/currency';
import { formatDateFr } from '../utils/dates';
import * as Icons from 'lucide-react';

export const ExpenseCard = ({ expense, onDelete }) => {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const category = getCategoryById(expense.categorie);
  
  // Obtenir dynamiquement l'icône Lucide
  const IconComponent = Icons[category.icon] || Icons.Tag;

  return (
    <>
      <div className="group relative bg-white dark:bg-gray-800/90 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-800/80 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          {/* Icône de catégorie avec couleur spécifique */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: category.bgColor, color: category.color }}
          >
            <IconComponent className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
              {expense.description}
            </h4>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <span className="font-medium px-2 py-0.5 rounded-full text-[10px] bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300">
                {category.label}
              </span>
              <span>•</span>
              <span>{formatDateFr(expense.date)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 ml-2">
          {/* Miniature Photo de facture si présente */}
          {expense.photo_url && (
            <button
              onClick={() => setShowPhotoModal(true)}
              className="w-9 h-9 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform shrink-0"
              title="Voir la photo de facture"
            >
              <img
                src={expense.photo_url}
                alt="Facture"
                className="w-full h-full object-cover"
              />
            </button>
          )}

          <div className="text-right">
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {formatTND(expense.montant)}
            </div>
          </div>

          {/* Bouton de suppression */}
          {onDelete && (
            <button
              onClick={() => onDelete(expense.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Supprimer"
            >
              <Icons.Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Modal Zoom Photo Facture */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowPhotoModal(false)}>
          <div className="relative max-w-sm w-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl p-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-2 mb-2">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Receipt Photo</span>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={expense.photo_url}
              alt="Facture agrandie"
              className="w-full h-auto max-h-96 object-contain rounded-2xl border border-gray-100 dark:border-gray-800"
            />
          </div>
        </div>
      )}
    </>
  );
};
