-- =======================================================
-- SCRIPT DE CONFIGURATION SUPABASE POUR "MES DÉPENSES"
-- Devise : Dinar Tunisien (TND - 3 décimales)
-- =======================================================

-- 1. Création de la table depenses
CREATE TABLE IF NOT EXISTS public.depenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    montant DECIMAL(12, 3) NOT NULL CHECK (montant >= 0),
    description TEXT NOT NULL,
    categorie TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour optimiser les filtres par utilisateur, date et catégorie
CREATE INDEX IF NOT EXISTS idx_depenses_user_id ON public.depenses(user_id);
CREATE INDEX IF NOT EXISTS idx_depenses_date ON public.depenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_depenses_categorie ON public.depenses(categorie);

-- 2. Activation de la Sécurité au Niveau des Lignes (RLS)
ALTER TABLE public.depenses ENABLE ROW LEVEL SECURITY;

-- Stratégie pour SELECT : L'utilisateur ne voit que ses propres dépenses
CREATE POLICY "Les utilisateurs lisent leurs propres dépenses"
ON public.depenses
FOR SELECT
USING (auth.uid() = user_id);

-- Stratégie pour INSERT : L'utilisateur insère uniquement avec son propre ID
CREATE POLICY "Les utilisateurs insèrent leurs propres dépenses"
ON public.depenses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Stratégie pour UPDATE : L'utilisateur modifie ses propres dépenses
CREATE POLICY "Les utilisateurs modifient leurs propres dépenses"
ON public.depenses
FOR UPDATE
USING (auth.uid() = user_id);

-- Stratégie pour DELETE : L'utilisateur supprime ses propres dépenses
CREATE POLICY "Les utilisateurs suppriment leurs propres dépenses"
ON public.depenses
FOR DELETE
USING (auth.uid() = user_id);

-- 3. Configuration du Bucket Storage "factures"
INSERT INTO storage.buckets (id, name, public)
VALUES ('factures', 'factures', true)
ON CONFLICT (id) DO NOTHING;

-- Stratégie Storage : Téléversement autorisé aux utilisateurs authentifiés
CREATE POLICY "Utilisateurs authentifiés peuvent téléverser des factures"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'factures' AND auth.role() = 'authenticated');

-- Stratégie Storage : Lecture publique des factures
CREATE POLICY "Tout le monde peut lire les factures"
ON storage.objects
FOR SELECT
USING (bucket_id = 'factures');

CREATE POLICY "Utilisateurs peuvent supprimer leurs propres factures"
ON storage.objects
FOR DELETE
USING (bucket_id = 'factures' AND auth.uid()::text = (storage.foldername(name))[1]);
