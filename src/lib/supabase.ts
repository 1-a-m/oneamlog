import { createClient } from '@supabase/supabase-js';
import type { Bindings } from '../types';

export function createSupabaseClient(env: Bindings) {
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,  // New API key format (sb_publishable_...)
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );
}

export function createSupabaseAdminClient(env: Bindings) {
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,  // New API key format (sb_secret_...)
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
