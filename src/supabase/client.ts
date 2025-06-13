// src/supabase/client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/supabase/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

declare global {
  // eslint-disable-next-line no-var
  var __supabase_client_instance__: SupabaseClient<Database> | undefined;
}

let supabase: SupabaseClient<Database>;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Supabase URL and/or Anon Key are missing.';
  console.error(errorMessage);
  throw new Error(errorMessage); // Asegúrate que esto detenga la app

} else {
  if (import.meta.env.DEV) { // Usar import.meta.env.DEV para Vite
    if (globalThis.__supabase_client_instance__) {
      supabase = globalThis.__supabase_client_instance__;
    } else {
      supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
      globalThis.__supabase_client_instance__ = supabase;
    }
  } else {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
}

export { supabase };