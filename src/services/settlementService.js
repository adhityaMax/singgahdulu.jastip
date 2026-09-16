import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

export async function fetchSettlementsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from('settlements').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveSettlementToSupabase(settlement) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Silakan login kembali.');
  const { error } = await supabase.from('settlements').insert({
    id: settlement.id,
    batch_id: settlement.batchId,
    partner: settlement.partner,
    amount: Number(settlement.amount || 0),
    source: settlement.source,
    note: settlement.note || '',
    date: settlement.date,
    created_by: user.id,
  });
  if (error) throw error;
  return true;
}