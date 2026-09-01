/**
 * Utilitaire de formatage de la monnaie en Dinars Tunisiens (TND)
 * En Tunisie, 1 TND = 1000 millimes, donc les montants s'affichent avec 3 décimales.
 */

export const formatTND = (amount) => {
  const numericVal = parseFloat(amount) || 0;
  // Formatage avec 3 décimales et séparateur d'espace pour les milliers
  const formatted = numericVal.toLocaleString('fr-TN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
  return `${formatted} TND`;
};

export const formatShortTND = (amount) => {
  const numericVal = parseFloat(amount) || 0;
  if (numericVal >= 1000) {
    return `${(numericVal / 1000).toFixed(1)}k TND`;
  }
  return `${numericVal.toFixed(1)} DT`;
};
