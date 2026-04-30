import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigReady = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseConfigReady ? createClient(supabaseUrl as string, supabaseAnonKey as string) : null;
