import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { DEFAULT_SETTINGS, DEFAULT_BATCHES, DEFAULT_ORDERS, DEFAULT_EXPENSES } from '../data/dummyData';

// --- SETTINGS SERVICE ---
export async function getSettings() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (error) {
        console.error('[Supabase Error] getSettings:', error);
      } else if (data) {
        return {
          storeName: data.store_name,
          ig: data.ig,
          wa: data.wa,
          address: data.address,
          logoUrl: data.logo_url || '',
        };
      }
    } catch (e) {
      console.warn('Supabase fetch settings failed, fallback to local storage:', e);
    }
  }

  const saved = localStorage.getItem('singgahdulu_settings');
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
}

export async function saveSettings(settings) {
  localStorage.setItem('singgahdulu_settings', JSON.stringify(settings));

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('settings').upsert({
        id: 1,
        store_name: settings.storeName,
        ig: settings.ig,
        wa: settings.wa,
        address: settings.address,
        logo_url: settings.logoUrl,
        updated_at: new Date().toISOString(),
      });
      if (error) console.error('[Supabase Error] saveSettings:', error);
    } catch (e) {
      console.error('Failed to sync settings to Supabase:', e);
    }
  }
}

// --- BATCHES SERVICE ---
export async function getBatches() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('batches').select('*').order('created_at', { ascending: true });
      if (error) {
        console.error('[Supabase Error] getBatches:', error);
      } else if (data && data.length > 0) {
        return data.map((b) => ({
          id: b.id,
          name: b.name,
          route: b.route,
          cutoffDate: b.cutoff_date,
          arrivalDate: b.arrival_date,
          status: b.status,
          notes: b.notes,
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch batches failed, fallback to local storage:', e);
    }
  }

  const saved = localStorage.getItem('singgahdulu_batches');
  return saved ? JSON.parse(saved) : DEFAULT_BATCHES;
}

export async function saveBatches(batches) {
  localStorage.setItem('singgahdulu_batches', JSON.stringify(batches));
}

export async function upsertBatch(batch) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('batches').upsert({
        id: batch.id,
        name: batch.name,
        route: batch.route,
        cutoff_date: batch.cutoffDate || null,
        arrival_date: batch.arrivalDate || null,
        status: batch.status,
        notes: batch.notes,
      });
      if (error) console.error('[Supabase Error] upsertBatch:', error);
    } catch (e) {
      console.error('Failed to sync batch to Supabase:', e);
    }
  }
}

// --- ORDERS SERVICE ---
export async function getOrders() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('[Supabase Error] getOrders:', error);
      } else if (data && data.length > 0) {
        return data.map((o) => ({
          id: o.id,
          batchId: o.batch_id,
          date: o.date,
          customer: o.customer,
          phone: o.phone,
          item: o.item,
          store: o.store,
          price: Number(o.price),
          fee: Number(o.fee),
          qty: Number(o.qty),
          payStatus: o.pay_status,
          dpAmount: Number(o.dp_amount || 0),
          itemStatus: o.item_status,
          buyer: o.buyer,
          pickup: o.pickup,
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch orders failed, fallback to local storage:', e);
    }
  }

  const saved = localStorage.getItem('singgahdulu_orders');
  return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
}

export async function saveOrders(orders) {
  localStorage.setItem('singgahdulu_orders', JSON.stringify(orders));
}

export async function upsertOrder(order) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('orders').upsert({
        id: order.id,
        batch_id: order.batchId,
        date: order.date,
        customer: order.customer,
        phone: order.phone,
        item: order.item,
        store: order.store,
        price: order.price,
        fee: order.fee,
        qty: order.qty,
        pay_status: order.payStatus,
        dp_amount: order.dpAmount,
        item_status: order.itemStatus,
        buyer: order.buyer,
        pickup: order.pickup,
      });
      if (error) console.error('[Supabase Error] upsertOrder:', error);
    } catch (e) {
      console.error('Failed to sync order to Supabase:', e);
    }
  }
}

export async function deleteOrderFromDb(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) console.error('[Supabase Error] deleteOrder:', error);
    } catch (e) {
      console.error('Failed to delete order from Supabase:', e);
    }
  }
}

// --- EXPENSES SERVICE ---
export async function getExpenses() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('[Supabase Error] getExpenses:', error);
      } else if (data && data.length > 0) {
        return data.map((e) => ({
          id: e.id,
          batchId: e.batch_id,
          date: e.date,
          category: e.category,
          amount: Number(e.amount),
          note: e.note,
          paidBy: e.paid_by,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch expenses failed, fallback to local storage:', err);
    }
  }

  const saved = localStorage.getItem('singgahdulu_expenses');
  return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
}

export async function saveExpenses(expenses) {
  localStorage.setItem('singgahdulu_expenses', JSON.stringify(expenses));
}

export async function upsertExpense(expense) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('expenses').upsert({
        id: expense.id,
        batch_id: expense.batchId,
        date: expense.date,
        category: expense.category,
        amount: expense.amount,
        note: expense.note,
        paid_by: expense.paidBy,
      });
      if (error) console.error('[Supabase Error] upsertExpense:', error);
    } catch (e) {
      console.error('Failed to sync expense to Supabase:', e);
    }
  }
}

export async function deleteExpenseFromDb(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) console.error('[Supabase Error] deleteExpense:', error);
    } catch (e) {
      console.error('Failed to delete expense from Supabase:', e);
    }
  }
}
