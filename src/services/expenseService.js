import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { formatExpenseFromDb, formatExpenseToDb } from '../models/expenseModel';

export async function fetchExpensesFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return data ? data.map(formatExpenseFromDb) : [];
}

export async function upsertExpenseToSupabase(expense) {
  if (!isSupabaseConfigured || !supabase) return false;
  const payload = formatExpenseToDb(expense);
  const { error } = await supabase.from('expenses').upsert(payload);
  if (error) {
    throw error;
  }
  return true;
}

export async function deleteExpenseFromSupabase(id) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) {
    throw error;
  }
  return true;
}
