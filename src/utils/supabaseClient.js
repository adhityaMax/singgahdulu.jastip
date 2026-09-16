import { createClient } from '@supabase/supabase-js';

function sanitizeSupabaseUrl(url) {
  if (!url) return '';
  let cleaned = url.trim().replace(/^["']|["']$/g, '');
  cleaned = cleaned.replace(/\/+$/, '');
  if (cleaned.endsWith('/rest/v1')) {
    cleaned = cleaned.replace(/\/rest\/v1$/, '');
  }
  return cleaned;
}

function sanitizeAnonKey(key) {
  if (!key) return '';
  return key.trim().replace(/^["']|["']$/g, '');
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
export const supabaseAnonKey = sanitizeAnonKey(rawKey);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('xyzcompany.supabase.co')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
