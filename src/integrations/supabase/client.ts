import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY, 
  {
    auth: {
      storage: window.localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
