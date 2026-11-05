import { createClient } from '@supabase/supabase-js';

/* Beides ist öffentlich vorgesehen (Browser-Schlüssel). Die Sicherheit liegt in den RLS-Regeln der Datenbank.
   Per .env überschreibbar: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY. */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uzercrfhieipplgrjbvk.supabase.co';
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Fe851H8Bv5uUX5_xBrbXdg_6msn6N_X';

export const sb = createClient(SUPABASE_URL, KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
