const STORAGE_KEY = 'singgahdulu_settlements';
import { fetchSettlementsFromSupabase, saveSettlementToSupabase } from '../services/settlementService';

export async function fetchSettlementsController() {
  const remote = await fetchSettlementsFromSupabase();
  if (remote) {
    const settlements = remote.map((item) => ({ id: item.id, batchId: item.batch_id, partner: item.partner, amount: item.amount, source: item.source, note: item.note, date: item.date }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settlements));
    return settlements;
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveSettlementsLocalController(settlements) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settlements));
}

export async function saveSettlementController(settlement) {
  return saveSettlementToSupabase(settlement);
}