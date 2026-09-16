import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function service(name, result, networkError = null) {
  const source = await readFile(new URL(`../src/services/${name}Service.js`, import.meta.url), 'utf8');
  const mock = `
    const isSupabaseConfigured = true;
    const query = new Proxy({}, { get(_, key) {
      if (key === 'then') return (resolve, reject) => ${networkError ? `reject(new Error(${JSON.stringify(networkError)}))` : `resolve(${JSON.stringify(result)})`};
      return () => query;
    }});
    const supabase = { from: () => query, auth: { getUser: async () => ({ data: { user: { id: 'test-user' } } }) } };
    const formatBatchToDb = x => x, formatOrderToDb = x => x, formatExpenseToDb = x => x, formatSettingToDb = x => x;
    const formatBatchFromDb = x => x, formatOrderFromDb = x => x, formatExpenseFromDb = x => x, formatSettingFromDb = x => x;
  `;
  return import('data:text/javascript;base64,' + Buffer.from(mock + source.replace(/^import .*;\r?\n/gm, '')).toString('base64'));
}

for (const [name, fetchName, saveName] of [
  ['batch', 'fetchBatchesFromSupabase', 'upsertBatchToSupabase'],
  ['order', 'fetchOrdersFromSupabase', 'upsertOrderToSupabase'],
  ['expense', 'fetchExpensesFromSupabase', 'upsertExpenseToSupabase'],
  ['settlement', 'fetchSettlementsFromSupabase', 'saveSettlementToSupabase'],
]) {
  test(`${name}: empty database stays empty`, async () => {
    const api = await service(name, { data: [], error: null });
    assert.deepEqual(await api[fetchName](), []);
  });
  test(`${name}: rejected writes propagate to the form`, async () => {
    const api = await service(name, { data: null, error: { message: 'RLS denied' } });
    await assert.rejects(api[saveName]({}), { message: 'RLS denied' });
    await assert.rejects(api[fetchName](), { message: 'RLS denied' });
  });
  test(`${name}: network failures are not disguised as local success`, async () => {
    const api = await service(name, null, 'Offline');
    await assert.rejects(api[saveName]({}), /Offline/);
  });
}
