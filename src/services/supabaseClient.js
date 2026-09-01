import { createClient } from '@supabase/supabase-js';
import { INITIAL_MOCK_EXPENSES, DEFAULT_BUDGET } from '../utils/mockData';

// Obtenir la configuration depuis localStorage ou .env
const getSupabaseConfig = () => {
  const savedUrl = localStorage.getItem('supabase_url');
  const savedKey = localStorage.getItem('supabase_key');
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return {
    url: savedUrl || envUrl || '',
    key: savedKey || envKey || ''
  };
};

let supabaseInstance = null;

export const initSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (url && key && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (e) {
      console.warn('Erreur initialisation Supabase Client, bascule sur mode LocalStorage', e);
      supabaseInstance = null;
    }
  }
  return null;
};

// Initialisation au chargement
initSupabaseClient();

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('http'));
};

/**
 * AUTHENTIFICATION GMAIL / GOOGLE & EMAIL (Supabase Auth)
 */

export const signInWithGoogle = async () => {
  const client = initSupabaseClient();
  if (!client) throw new Error('Supabase client non configuré');

  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });

  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email, password) => {
  const client = initSupabaseClient();
  if (!client) throw new Error('Supabase client non configuré');

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email, password) => {
  const client = initSupabaseClient();
  if (!client) throw new Error('Supabase client non configuré');

  const { data, error } = await client.auth.signUp({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const signOutUser = async () => {
  const client = initSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }
  localStorage.removeItem('supabase_user_session');
};

export const getCurrentUser = async () => {
  const client = initSupabaseClient();
  if (client) {
    const { data: { user } } = await client.auth.getUser();
    return user;
  }
  return null;
};

export const onAuthStateChange = (callback) => {
  const client = initSupabaseClient();
  if (client) {
    return client.auth.onAuthStateChange((event, session) => {
      callback(event, session?.user || null);
    });
  }
  return { data: { subscription: { unsubscribe: () => {} } } };
};

/**
 * GESTION DES DÉPENSES (Supabase + LocalStorage Fallback)
 */
export const getExpenses = async () => {
  const client = initSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('depenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (!error && data) {
        localStorage.setItem('local_depenses', JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('Erreur Supabase getExpenses, lecture locale:', err);
    }
  }

  // Fallback LocalStorage
  const localData = localStorage.getItem('local_depenses');
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      // ignore
    }
  }

  localStorage.setItem('local_depenses', JSON.stringify(INITIAL_MOCK_EXPENSES));
  return INITIAL_MOCK_EXPENSES;
};

export const addExpense = async (expenseData) => {
  const client = initSupabaseClient();
  const user = await getCurrentUser();
  const newId = 'exp-' + Date.now();

  const formattedExpense = {
    ...expenseData,
    id: newId,
    user_id: user ? user.id : null,
    montant: parseFloat(expenseData.montant),
    date: expenseData.date || new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  if (client) {
    try {
      const insertPayload = {
        montant: formattedExpense.montant,
        description: formattedExpense.description,
        categorie: formattedExpense.categorie,
        date: formattedExpense.date,
        photo_url: formattedExpense.photo_url || null
      };

      if (user) {
        insertPayload.user_id = user.id;
      }

      const { data, error } = await client
        .from('depenses')
        .insert([insertPayload])
        .select();

      if (!error && data && data.length > 0) {
        const current = await getExpenses();
        const updated = [data[0], ...current];
        localStorage.setItem('local_depenses', JSON.stringify(updated));
        return data[0];
      }
    } catch (err) {
      console.warn('Erreur insertion Supabase, enregistrement local:', err);
    }
  }

  const current = await getExpenses();
  const updated = [formattedExpense, ...current];
  localStorage.setItem('local_depenses', JSON.stringify(updated));
  return formattedExpense;
};

export const deleteExpense = async (id) => {
  const client = initSupabaseClient();
  if (client) {
    try {
      await client.from('depenses').delete().eq('id', id);
    } catch (err) {
      console.warn('Erreur suppression Supabase:', err);
    }
  }

  const current = await getExpenses();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem('local_depenses', JSON.stringify(updated));
  return true;
};

/**
 * UPLOAD DE PHOTO EN FACTURE
 */
export const uploadExpensePhoto = async (file) => {
  const client = initSupabaseClient();
  if (client && file) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `factures/${fileName}`;

      const { data, error } = await client.storage
        .from('factures')
        .upload(filePath, file);

      if (!error && data) {
        const { data: publicUrlData } = client.storage
          .from('factures')
          .getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('Erreur upload Supabase storage, conversion Base64 locale:', err);
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * GESTION DU BUDGET MENSUEL
 */
export const getMonthlyBudget = () => {
  const b = localStorage.getItem('user_monthly_budget');
  return b ? parseFloat(b) : DEFAULT_BUDGET;
};

export const setMonthlyBudget = (budget) => {
  localStorage.setItem('user_monthly_budget', budget.toString());
};
