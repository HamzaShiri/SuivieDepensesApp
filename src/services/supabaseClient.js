import { createClient } from '@supabase/supabase-js';
import { INITIAL_MOCK_EXPENSES, DEFAULT_BUDGET } from '../utils/mockData';

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
      console.warn('Erreur initialisation Supabase Client:', e);
      supabaseInstance = null;
    }
  }
  return null;
};

initSupabaseClient();

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('http'));
};

/**
 * AUTHENTIFICATION GMAIL / GOOGLE & EMAIL
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

  if (error) {
    console.error('Erreur Supabase Google Auth:', error);
    throw error;
  }
  return data;
};

export const signInWithEmail = async (email, password) => {
  const client = initSupabaseClient();
  if (!client) throw new Error('Supabase client non configuré');

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Erreur Supabase Email Auth:', error);
    throw error;
  }
  return data;
};

export const signUpWithEmail = async (email, password) => {
  const client = initSupabaseClient();
  if (!client) throw new Error('Supabase client non configuré');

  const { data, error } = await client.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error('Erreur Supabase SignUp:', error);
    throw error;
  }
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
    try {
      const { data: { user } } = await client.auth.getUser();
      return user;
    } catch (e) {
      return null;
    }
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
 * GESTION DES DÉPENSES AVEC ALIGNEMENT RLS (user_id = auth.uid())
 */
export const getExpenses = async () => {
  const client = initSupabaseClient();
  const user = await getCurrentUser();

  if (client && user) {
    try {
      const { data, error } = await client
        .from('depenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (!error && data) {
        localStorage.setItem(`user_expenses_${user.id}`, JSON.stringify(data));
        return data;
      } else if (error) {
        console.warn('Erreur RLS Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Exception lecture Supabase:', err);
    }
  }

  // Lecture fallback locale isolée par utilisateur
  if (user) {
    const userLocalData = localStorage.getItem(`user_expenses_${user.id}`);
    if (userLocalData) {
      try {
        return JSON.parse(userLocalData);
      } catch (e) {}
    }
  }

  const localData = localStorage.getItem('local_depenses');
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {}
  }

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

  let isSavedInCloud = false;

  if (client && user) {
    try {
      const insertPayload = {
        user_id: user.id, // Strictement requis par la politique RLS Supabase
        montant: formattedExpense.montant,
        description: formattedExpense.description,
        categorie: formattedExpense.categorie,
        date: formattedExpense.date,
        photo_url: formattedExpense.photo_url || null
      };

      const { data, error } = await client
        .from('depenses')
        .insert([insertPayload])
        .select();

      if (!error && data && data.length > 0) {
        isSavedInCloud = true;
        const current = await getExpenses();
        const updated = [data[0], ...current];
        localStorage.setItem(`user_expenses_${user.id}`, JSON.stringify(updated));
        return { item: data[0], cloud: true };
      } else if (error) {
        console.error('⚠️ Erreur Insertion Supabase (RLS):', error.message, error.details);
      }
    } catch (err) {
      console.error('⚠️ Exception insertion Supabase:', err);
    }
  }

  // Fallback Local Storage
  const current = await getExpenses();
  const updated = [formattedExpense, ...current];
  if (user) {
    localStorage.setItem(`user_expenses_${user.id}`, JSON.stringify(updated));
  } else {
    localStorage.setItem('local_depenses', JSON.stringify(updated));
  }

  return { item: formattedExpense, cloud: isSavedInCloud };
};

export const deleteExpense = async (id) => {
  const client = initSupabaseClient();
  const user = await getCurrentUser();

  if (client) {
    try {
      await client.from('depenses').delete().eq('id', id);
    } catch (err) {
      console.warn('Erreur suppression Supabase:', err);
    }
  }

  const current = await getExpenses();
  const updated = current.filter(item => item.id !== id);
  if (user) {
    localStorage.setItem(`user_expenses_${user.id}`, JSON.stringify(updated));
  } else {
    localStorage.setItem('local_depenses', JSON.stringify(updated));
  }
  return true;
};

/**
 * OUTIL DE DIAGNOSTIC DE CONNEXION SUPABASE
 */
export const testSupabaseDatabaseConnection = async () => {
  const client = initSupabaseClient();
  const user = await getCurrentUser();

  if (!client) return { success: false, message: 'Client Supabase non initialisé.' };
  if (!user) return { success: false, message: 'Aucun utilisateur authentifié. Connectez-vous d\'abord.' };

  try {
    const { data, error } = await client
      .from('depenses')
      .select('count', { count: 'exact', head: true });

    if (error) {
      return { success: false, message: `Erreur table "depenses" : ${error.message}` };
    }

    return { success: true, message: `Connexion Cloud Supabase OK ! Table "depenses" accessible.` };
  } catch (err) {
    return { success: false, message: `Exception Supabase : ${err.message}` };
  }
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
      console.warn('Erreur upload Supabase storage:', err);
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

export const getMonthlyBudget = () => {
  const b = localStorage.getItem('user_monthly_budget');
  return b ? parseFloat(b) : DEFAULT_BUDGET;
};

export const setMonthlyBudget = (budget) => {
  localStorage.setItem('user_monthly_budget', budget.toString());
};
