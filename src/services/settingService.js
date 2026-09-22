import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { formatSettingFromDb, formatSettingToDb } from '../models/settingModel';

const LOGO_BUCKET = 'store-assets';
const LOGO_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

export function validateLogoFile(file) {
  if (!LOGO_TYPES[file.type]) throw new Error('Logo harus berupa PNG, JPG, atau WebP.');
  if (file.size > 2 * 1024 * 1024) throw new Error('Ukuran logo maksimal 2 MB.');
}

export async function uploadLogoToSupabase(file) {
  validateLogoFile(file);
  if (!isSupabaseConfigured || !supabase) return null;
  const path = `logos/${crypto.randomUUID()}.${LOGO_TYPES[file.type]}`;
  const { error } = await supabase.storage.from(LOGO_BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(LOGO_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function fetchSettingsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
  if (error) {
    throw error;
  }
  return formatSettingFromDb(data);
}

export async function saveSettingsToSupabase(setting) {
  if (!isSupabaseConfigured || !supabase) return false;
  const payload = formatSettingToDb(setting);
  const { error } = await supabase.from('settings').upsert(payload);
  if (error) {
    throw error;
  }
  return setting;
}
