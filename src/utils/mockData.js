/**
 * Données de démonstration initiales (en Dinars Tunisiens TND)
 * Simule des dépenses récentes réelles avec dates ajustées dynamiquement.
 */

const today = new Date();
const getDateAgo = (daysAgo) => {
  const d = new Date(today);
  d.setDate(today.getDate() - daysAgo);
  return d.toISOString();
};

export const INITIAL_MOCK_EXPENSES = [
  {
    id: 'exp-1',
    description: 'Achat fruits et légumes au marché',
    montant: 18.500,
    categorie: 'Nourriture',
    date: getDateAgo(0), // Aujourd'hui
    photo_url: null,
    created_at: getDateAgo(0),
  },
  {
    id: 'exp-2',
    description: 'Course Taxi Centre-Ville',
    montant: 4.200,
    categorie: 'Transport',
    date: getDateAgo(0), // Aujourd'hui
    photo_url: null,
    created_at: getDateAgo(0),
  },
  {
    id: 'exp-3',
    description: 'Café Direct & Bouteille d\'eau',
    montant: 2.800,
    categorie: 'Divertissement',
    date: getDateAgo(1), // Hier
    photo_url: null,
    created_at: getDateAgo(1),
  },
  {
    id: 'exp-4',
    description: 'Facture STEG Électricité',
    montant: 85.300,
    categorie: 'Factures',
    date: getDateAgo(2),
    photo_url: null,
    created_at: getDateAgo(2),
  },
  {
    id: 'exp-5',
    description: 'Achat Médicaments Pharmacie',
    montant: 24.600,
    categorie: 'Santé',
    date: getDateAgo(3),
    photo_url: null,
    created_at: getDateAgo(3),
  },
  {
    id: 'exp-6',
    description: 'Courses Carrefour Express',
    montant: 62.450,
    categorie: 'Nourriture',
    date: getDateAgo(4),
    photo_url: null,
    created_at: getDateAgo(4),
  },
  {
    id: 'exp-7',
    description: 'Plein Essence Voiture',
    montant: 50.000,
    categorie: 'Transport',
    date: getDateAgo(5),
    photo_url: null,
    created_at: getDateAgo(5),
  },
  {
    id: 'exp-8',
    description: 'Loyer Appartement Mensuel',
    montant: 650.000,
    categorie: 'Logement',
    date: getDateAgo(6),
    photo_url: null,
    created_at: getDateAgo(6),
  },
  {
    id: 'exp-9',
    description: 'Achat Livres & Fournitures scolaires',
    montant: 35.000,
    categorie: 'Éducation',
    date: getDateAgo(10),
    photo_url: null,
    created_at: getDateAgo(10),
  },
  {
    id: 'exp-10',
    description: 'Shopping vêtements Zara',
    montant: 120.000,
    categorie: 'Shopping',
    date: getDateAgo(14),
    photo_url: null,
    created_at: getDateAgo(14),
  }
];

export const DEFAULT_BUDGET = 1200.000; // 1200 TND par mois
