import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { formatSettingFromDb, formatSettingToDb } from '../models/settingModel';

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
  return true;
}
