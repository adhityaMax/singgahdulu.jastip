import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { formatBatchFromDb, formatBatchToDb } from '../models/batchModel';

export async function fetchBatchesFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from('batches').select('*').order('created_at', { ascending: true });
  if (error) {
    throw error;
  }
  return data ? data.map(formatBatchFromDb) : [];
}

export async function upsertBatchToSupabase(batch) {
  if (!isSupabaseConfigured || !supabase) return false;
  const payload = formatBatchToDb(batch);
  const { error } = await supabase.from('batches').upsert(payload);
  if (error) {
    throw error;
  }
  return true;
}

export async function deleteBatchFromSupabase(batchId) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('batches').delete().eq('id', batchId);
  if (error) {
    throw error;
  }
  return true;
}
