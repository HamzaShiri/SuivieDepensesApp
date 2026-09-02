import { CATEGORIES } from '../utils/categories';

/**
 * MOTEUR DE PARSING MULTILINGUE & CODE-SWITCHING (Arabe + Français)
 * Préserve les mots dans leur écriture et langue d'origine sans traduction forcée.
 */

// Table d'extraction des montants en Français et Arabe Tunisien
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
 * Extrait le montant d'une phrase Code-Switching (Français + Arabe)
 */
export const extractAmountFromHybridText = (text) => {
  if (!text) return 0;
  const clean = text.trim().toLowerCase();

  // 1. Détection de chiffres directs (ex: "12.500", "5 dinars", "3.5 TND", "15 DT")
  const digitMatches = clean.match(/(\d+([.,]\d+)?)/);
  if (digitMatches) {
    const num = parseFloat(digitMatches[1].replace(',', '.'));
    if (clean.includes('آلاف') || clean.includes('ألف') || clean.includes('الف') || clean.includes('millimes')) {
      if (num >= 100) return num / 1000;
      return num;
    }
    return num;
  }

  // 2. Mots de nombre
  for (const item of MULTI_NUMBERS) {
    for (const w of item.words) {
      if (clean.includes(w)) {
        return item.val;
      }
    }
  }

  if (clean.includes('ألفين') || clean.includes('الفين')) return 2;
  if (clean.includes('ألف') || clean.includes('الف')) return 1;

  return 0;
};

/**
 * Détecte la catégorie la plus adaptée parmi les mots Français et Arabes
 */
export const detectCategoryFromText = (text) => {
  if (!text) return 'Autres';
  const lowerText = text.toLowerCase();

  const keywordsMap = {
    Nourriture: ['كسكسي', 'pain', 'gâteau', 'déjeuner', 'dîner', 'restaurant', 'supermarché', 'carrefour', 'monoprix', 'marché', 'poulet', 'viande', 'poisson', 'légumes', 'fruits', 'lait', 'eau', 'sandwich', 'pizza', 'makla', 'خبز', 'حوت', 'لحم', 'دجاج', 'خضرة', 'غلة', 'مغزة', 'عشاء', 'فطور', 'مركاز', 'بقالة', 'حليب', 'ماء', 'روز', 'شاورما'],
    Transport: ['taxi', 'bus', 'métro', 'train', 'essence', 'gazole', 'autoroute', 'parking', 'transport', 'louage', 'station', 'تاكسي', 'ترانسپور', 'كار', 'مترو', 'تران', 'مازوط', 'بنزين', 'اجرة', 'باركينغ'],
    Logement: ['loyer', 'maison', 'appartement', 'meuble', 'chaise', 'table', 'peinture', 'clé', 'serrure', 'كراء', 'دار', 'صيانة', 'أثاث'],
    Factures: ['facture', 'steg', 'sonede', 'téléphone', 'internet', 'recharge', 'ooredoo', 'orange', 'telecom', 'électricité', 'eau', 'wifi', 'فاتورة', 'ضؤ', 'ماء', 'أنترنيت', 'شارج', 'تلفون', 'كارت'],
    Santé: ['pharmacie', 'médicament', 'docteur', 'médecin', 'analyse', 'hôpital', 'santé', 'ordonnance', 'دواء', 'فرماسي', 'طبيب', 'سبيطار', 'حكيم', 'تحليل', 'صحة'],
    Éducation: ['livre', 'cahier', 'stylo', 'école', 'université', 'cours', 'formation', 'études', 'قراية', 'كتوب', 'كراسات', 'مدرسة', 'جامعة', 'فروض'],
    Shopping: ['vêtement', 'chaussure', 'pantalon', 'chemise', 'robe', 'zara', 'shopping', 'sac', 'montre', 'parfum', 'دبش', 'حوايج', 'صباط', 'سبرديلة', 'لبسة', 'مغازة'],
    Divertissement: ['café', 'cinéma', 'film', 'jeu', 'voyage', 'sport', 'gym', 'vacances', 'plage', 'sortie', 'قهوة', 'تفريد', 'العاب', 'نادي', 'جيم'],
  };

  for (const [catId, keywords] of Object.entries(keywordsMap)) {
    for (const kw of keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        return catId;
      }
    }
  }

  return 'Autres';
};

/**
 * Nettoie la description tout en CONSERVANT les mots arabes et français intacts
 */
export const cleanDescriptionFromText = (text) => {
  if (!text) return 'Dépense vocale';
  
  let desc = text
    .replace(/^salam,?\s*/i, '')
    .replace(/^salem,?\s*/i, '')
    .replace(/^bonjour,?\s*/i, '')
    .replace(/^bonsoir,?\s*/i, '')
    .replace(/s'il vous plaît/gi, '')
    .replace(/svp/gi, '')
    .replace(/عيشك/gi, '')
    .replace(/يرحم والديك/gi, '')
    .replace(/^je veux commander\s+/i, '')
    .replace(/^je veux acheter\s+/i, '')
    .replace(/^je veux\s+/i, '')
    .replace(/^j'ai acheté\s+/i, '')
    .replace(/^acheté\s+/i, '')
    .replace(/^payé\s+/i, '')
    .replace(/^شريت\s+/i, '')
    .replace(/^خلصت\s+/i, '')
    .replace(/^خذيت\s+/i, '')
    .replace(/^ركبت\s+/i, '')
    .replace(/à\s+\d+\s*(dinars?|dt|tnd)?/gi, '')
    .replace(/pour\s+\d+\s*(dinars?|dt|tnd)?/gi, '')
    .replace(/بـ\d+\s*دنانير?/g, '')
    .replace(/بثلاثة\s+دنانير/g, '')
    .replace(/بدينارين/g, '')
    .replace(/\d+\s*(dinars?|dt|tnd)/gi, '')
    .trim();

  if (desc && /^[a-zA-Z]/.test(desc)) {
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
  }

  return desc || text;
};

/**
 * Analyse complète
 */
export const parseHybridVoiceInput = (rawText) => {
  const montant = extractAmountFromHybridText(rawText);
  const categorie = detectCategoryFromText(rawText);
  const description = cleanDescriptionFromText(rawText);

  return {
    rawText,
    montant: montant > 0 ? montant : 1.000,
    categorie,
    description: description || 'Dépense vocale'
  };
};

/**
 * SpeechRecognition Web API (Support Robuste fr-FR, fr-TN et ar-TN)
 */
export const createSpeechRecognizer = ({ lang = 'fr-FR', onResult, onError, onEnd }) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  
  // Utiliser la langue choisie ('fr-FR' ou 'ar-TN')
  recognition.lang = lang || 'fr-FR';

  recognition.onresult = (event) => {
    let resultText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      resultText += event.results[i][0].transcript;
    }
    if (resultText) {
      onResult(resultText, true);
    }
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
};
