import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { formatOrderFromDb, formatOrderToDb } from '../models/orderModel';
import { getOrderTotal } from '../utils/orderTotals';

export async function fetchOrdersFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return data ? data.map(formatOrderFromDb) : [];
}

export async function upsertOrderToSupabase(order) {
  if (!isSupabaseConfigured || !supabase) return false;
  const payload = formatOrderToDb(order);
  const query = order.orderNo
    ? supabase.from('orders').update(payload).eq('id', order.id)
    : supabase.from('orders').insert(payload);
  const { data, error } = await query.select('*').single();
  if (error) {
    throw error;
  }
  return formatOrderFromDb(data);
}

export async function deleteOrderFromSupabase(id) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) {
    throw error;
  }
  return true;
}

// Update hanya kolom pembayaran, bukan seluruh isi pesanan.
export async function payOffOrder(order) {
  const total = getOrderTotal(order);
  if (!Number.isFinite(total) || total < 0) throw new Error('Total tagihan tidak valid.');
  if (order.payStatus === 'LUNAS') return order;
  if (!isSupabaseConfigured || !supabase) return { ...order, payStatus: 'LUNAS', dpAmount: total };
  const { data, error } = await supabase.from('orders')
    .update({ pay_status: 'LUNAS', dp_amount: total })
    .eq('id', order.id)
    .eq('pay_status', order.payStatus)
    .eq('items', JSON.stringify(order.items))
    .select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Pesanan sudah berubah atau tidak dapat diakses. Muat ulang halaman sebelum mencoba lagi.');
  return formatOrderFromDb(data);
}
