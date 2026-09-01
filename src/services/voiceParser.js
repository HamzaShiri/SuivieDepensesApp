import { CATEGORIES } from '../utils/categories';

/**
 * MOTEUR D'ANALYSE HYBRIDE FRANCO-ARABE (Code-Switching Tunisien & Français)
 * Traite les phrases mixtes fr-FR + ar-TN (ex: "شريت un café بدينارين", "Payé 5 dinars pour taxi")
 */

// Mappage des nombres en Français et Dialecte Arabe Tunisien
const MULTI_NUMBERS = [
  // Français
  { words: ['un dinar', '1 dinar', 'un dt', 'un tnd'], val: 1 },
  { words: ['deux dinars', 'deux dinar', '2 dinars', 'deux dt'], val: 2 },
  { words: ['trois dinars', '3 dinars', 'trois dt'], val: 3 },
  { words: ['quatre dinars', '4 dinars', 'quatre dt'], val: 4 },
  { words: ['cinq dinars', '5 dinars', 'cinq dt'], val: 5 },
  { words: ['six dinars', '6 dinars'], val: 6 },
  { words: ['sept dinars', '7 dinars'], val: 7 },
  { words: ['huit dinars', '8 dinars'], val: 8 },
  { words: ['neuf dinars', '9 dinars'], val: 9 },
  { words: ['dix dinars', '10 dinars', 'dix dt'], val: 10 },
  { words: ['quinze dinars', '15 dinars'], val: 15 },
  { words: ['vingt dinars', '20 dinars'], val: 20 },
  { words: ['vingt cinq dinars', '25 dinars'], val: 25 },
  { words: ['trente dinars', '30 dinars'], val: 30 },
  { words: ['cinquante dinars', '50 dinars'], val: 50 },
  { words: ['cent dinars', '100 dinars'], val: 100 },
  { words: ['deux dinars et demi', '2.5 dinars', 'deux et demi'], val: 2.5 },
  { words: ['trois dinars et demi', '3.5 dinars'], val: 3.5 },
  { words: ['un millime', '1000 millimes'], val: 1 },

  // Arabe Tunisien
  { words: ['دينار', 'واحد دينار', 'دنية'], val: 1 },
  { words: ['دينارين', 'زوز دنانير', 'زوز دينارات'], val: 2 },
  { words: ['ثلاثة دنانير', 'ثلاثة', 'ثلاثة دينارات'], val: 3 },
  { words: ['أربعة دنانير', 'أربعة', 'اربعة'], val: 4 },
  { words: ['خمسة دنانير', 'خمسة', 'خمسة دينارات'], val: 5 },
  { words: ['ستة دنانير', 'ستة'], val: 6 },
  { words: ['سبعة دنانير', 'سبعة'], val: 7 },
  { words: ['ثمانية دنانير', 'ثمانية', 'ثمانية دينارات'], val: 8 },
  { words: ['تسعة دنانير', 'تسعة'], val: 9 },
  { words: ['عشرة دنانير', 'عشرة'], val: 10 },
  { words: ['خمسة عشر', 'خمسطاش'], val: 15 },
  { words: ['عشرين دينار', 'عشرين'], val: 20 },
  { words: ['خمسة وعشرين', 'خمسة وعشرين دينار'], val: 25 },
  { words: ['ثلاثين', 'ثلاثين دينار'], val: 30 },
  { words: ['خمسين', 'خمسين دينار'], val: 50 },
  { words: ['مية', 'مائة', 'مية دينار'], val: 100 },
];

/**
 * Extrait le montant d'une phrase hybride (Français & Arabe)
 */
export const extractAmountFromHybridText = (text) => {
  if (!text) return 0;
  const clean = text.trim().toLowerCase();

  // 1. Détection directe de chiffres (ex: "12.500", "5 dinars", "3.5 TND", "15,500")
  const digitMatches = clean.match(/(\d+([.,]\d+)?)/);
  if (digitMatches) {
    const num = parseFloat(digitMatches[1].replace(',', '.'));
    if (clean.includes('آلاف') || clean.includes('ألف') || clean.includes('الف') || clean.includes('millimes')) {
      if (num >= 100) return num / 1000;
      return num;
    }
    return num;
  }

  // 2. Dictionnaire hybride de mots de nombre
  for (const item of MULTI_NUMBERS) {
    for (const w of item.words) {
      if (clean.includes(w)) {
        return item.val;
      }
    }
  }

  // 3. Cas spécifiques dialectaux & français
  if (clean.includes('ألفين') || clean.includes('الفين')) return 2;
  if (clean.includes('ألف') || clean.includes('الف')) return 1;

  return 0;
};

/**
 * Détecte la catégorie parmi les mots-clés Français & Arabes
 */
export const detectCategoryFromText = (text) => {
  if (!text) return 'Autres';
  const lowerText = text.toLowerCase();

  // Liste élargie de mots-clés Français + Arabes par catégorie
  const frenchKeywordsMap = {
    Nourriture: ['pain', 'gâteau', 'déjeuner', 'dîner', 'restaurant', 'supermarché', 'carrefour', 'monoprix', 'marché', 'poulet', 'viande', 'poisson', 'légumes', 'fruits', 'lait', 'eau', 'sandwich', 'pizza', 'makla', 'nourriture'],
    Transport: ['taxi', 'bus', 'métro', 'train', 'essence', 'gazole', 'autoroute', 'parking', 'transport', 'louage', 'volant', 'station'],
    Logement: ['loyer', 'maison', 'appartement', 'meuble', 'chaise', 'table', 'peinture', 'clé', 'serrure', 'ménage'],
    Factures: ['facture', 'steg', 'sonede', 'téléphone', 'internet', 'recharge', 'ooredoo', 'orange', 'telecom', 'électricité', 'eau', 'wifi'],
    Santé: ['pharmacie', 'médicament', 'docteur', 'médecin', 'analyse', 'hôpital', 'santé', 'ordonnance', 'sirop', 'pilule'],
    Éducation: ['livre', 'cahier', 'stylo', 'école', 'université', 'cours', 'formation', 'études', 'Inscription'],
    Shopping: ['vêtement', 'chaussure', 'pantalon', 'chemise', 'robe', 'zara', 'shopping', 'sac', 'montre', 'parfum'],
    Divertissement: ['café', 'cinéma', 'film', 'jeu', 'voyage', 'sport', 'gym', 'vacances', 'plage', 'sortie', 'match'],
  };

  // 1. Tester les mots-clés français
  for (const [catId, keywords] of Object.entries(frenchKeywordsMap)) {
    for (const kw of keywords) {
      if (lowerText.includes(kw)) {
        return catId;
      }
    }
  }

  // 2. Tester les mots-clés arabes standards
  for (const cat of CATEGORIES) {
    for (const kw of cat.keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        return cat.id;
      }
    }
  }

  return 'Autres';
};

/**
 * Nettoie la description en retirant les verbes d'action et mots de bruit
 */
export const cleanDescriptionFromText = (text) => {
  if (!text) return 'Dépense vocale';
  
  let desc = text
    // Bruit Arabe
    .replace(/^شريت\s+/i, '')
    .replace(/^خلصت\s+/i, '')
    .replace(/^خذيت\s+/i, '')
    .replace(/^ركبت\s+/i, '')
    .replace(/بثلاثة\s+دنانير/g, '')
    .replace(/بدينارين/g, '')
    .replace(/بـ\d+\s*دنانير?/g, '')
    // Bruit Français
    .replace(/^j'ai acheté\s+/i, '')
    .replace(/^acheté\s+/i, '')
    .replace(/^payé\s+/i, '')
    .replace(/^course de\s+/i, '')
    .replace(/^facture de\s+/i, '')
    .replace(/pour\s+\d+\s*dinars?/gi, '')
    .replace(/à\s+\d+\s*dinars?/gi, '')
    .replace(/\d+\s*dinars?/gi, '')
    .replace(/\d+\s*dt/gi, '')
    .replace(/\d+\s*tnd/gi, '')
    .replace(/دنانير|دينار|مليم|DT|TND/gi, '')
    .trim();

  // Capitaliser la première lettre
  if (desc) {
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
  }

  return desc || text;
};

/**
 * Analyse complète de la phrase vocale hybride
 */
export const parseHybridVoiceInput = (rawText) => {
  const montant = extractAmountFromHybridText(rawText);
  const categorie = detectCategoryFromText(rawText);
  const description = cleanDescriptionFromText(rawText);

  return {
    rawText,
    montant: montant > 0 ? montant : 1.000,
    categorie,
    description: description || 'Dépense'
  };
};

/**
 * Initialise le Web Speech API (Langue multilingue ar-TN / fr-FR)
 */
export const createSpeechRecognizer = ({ lang = 'ar-TN', onResult, onError, onEnd }) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang; // 'ar-TN' ou 'fr-FR' ou 'fr-TN'

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    onResult(transcript, event.results[0].isFinal);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
};
