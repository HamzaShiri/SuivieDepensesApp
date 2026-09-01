import { CATEGORIES } from '../utils/categories';

/**
 * Moteur d'analyse du dialecte arabe tunisien (ar-TN)
 * Convertit la parole reconnue en structure de dépense { description, montant, categorie }.
 */

// Mappage des mots de nombre en dialecte tunisien vers des valeurs numériques
const TUNISIAN_NUMBERS = [
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
 * Extrait le montant d'une phrase en arabe tunisien
 */
export const extractAmountFromTunisianText = (text) => {
  if (!text) return 0;
  const clean = text.trim();

  // 1. Chercher les chiffres directs (ex: "3.5", "10", "12.500", "5")
  const digitMatches = clean.match(/(\d+([.,]\d+)?)/);
  if (digitMatches) {
    const num = parseFloat(digitMatches[1].replace(',', '.'));
    // Si la phrase contient "آلاف" ou "مليم" ou "الف" (ex: 5 آلاف = 5 TND)
    if (clean.includes('آلاف') || clean.includes('ألف') || clean.includes('الف')) {
      if (num >= 100) return num / 1000; // ex: 5000 مليم -> 5 TND
      return num; // ex: 5 آلاف -> 5 TND
    }
    return num;
  }

  // 2. Chercher les mots de nombres tunisiens
  for (const item of TUNISIAN_NUMBERS) {
    for (const w of item.words) {
      if (clean.includes(w)) {
        return item.val;
      }
    }
  }

  // 3. Cas spécifiques : "ألفين" = 2 TND, "خمسة آلاف" = 5 TND
  if (clean.includes('ألفين') || clean.includes('الفين')) return 2;
  if (clean.includes('ألف') || clean.includes('الف')) return 1;

  return 0;
};

/**
 * Détermine la catégorie la plus pertinente en fonction du texte
 */
export const detectCategoryFromText = (text) => {
  if (!text) return 'Autres';
  const lowerText = text.toLowerCase();

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
 * Nettoie la description en retirant les mots de bruit comme "شريت", "بـ", "دنانير"
 */
export const cleanDescriptionFromText = (text) => {
  if (!text) return 'Dépense vocale';
  
  let desc = text
    .replace(/^شريت\s+/i, '')
    .replace(/^خلصت\s+/i, '')
    .replace(/^خذيت\s+/i, '')
    .replace(/^ركبت\s+/i, '')
    .replace(/بثلاثة\s+دنانير/g, '')
    .replace(/بدينارين/g, '')
    .replace(/بـ\d+\s*دنانير?/g, '')
    .replace(/بـ\d+/g, '')
    .replace(/دنانير|دينار|مليم|DT|TND/gi, '')
    .trim();

  return desc || text;
};

/**
 * Analyse complète de la phrase vocale
 */
export const parseTunisianVoiceInput = (rawText) => {
  const montant = extractAmountFromTunisianText(rawText);
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
 * Initialise le Web Speech API pour l'Arabe Tunisien (ar-TN)
 */
export const createSpeechRecognizer = ({ onResult, onError, onEnd }) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'ar-TN'; // Arabe Tunisien (ou ar-SA fallback)

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
