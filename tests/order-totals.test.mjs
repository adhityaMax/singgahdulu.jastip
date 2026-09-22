import test from 'node:test';
import assert from 'node:assert/strict';
import { getOrderTotal, getOrderTotals } from '../src/utils/orderTotals.js';
import { calculateMetrics } from '../src/utils/metrics.js';

test('pesanan baru belum bayar menjumlahkan harga dan fee dari setiap barang', () => {
  const order = { payStatus: 'BELUM_BAYAR', items: [
    { item: 'Barang A', price: '10000', fee: '2000', qty: '2' },
    { item: 'Barang B', price: '15000', fee: '3000', qty: '1' },
  ] };
  assert.deepEqual(getOrderTotals(order), { price: 35000, fee: 7000 });
  assert.equal(getOrderTotal(order), 42000);
});

test('pesanan lama satu barang tetap dihitung', () => {
  assert.equal(getOrderTotal({ price: 10000, fee: 2000, qty: 2 }), 24000);
});

test('dashboard menghitung omzet, modal, fee, dan piutang hanya dari items', () => {
  const order = { payStatus: 'BELUM_BAYAR', itemStatus: 'DIBELI', buyer: 'Umay', items: [
    { item: 'A', store: 'Toko', price: 10000, fee: 2000, qty: 2 },
    { item: 'B', store: 'Toko', price: 15000, fee: 3000, qty: 1 },
  ] };
  const metrics = calculateMetrics([order], []);
  assert.equal(metrics.totalOmset, 42000);
  assert.equal(metrics.totalModal, 35000);
  assert.equal(metrics.totalGrossFee, 7000);
  assert.equal(metrics.totalRemainingUnpaid, 42000);
  assert.equal(metrics.partnerBreakdown.umayModal, 35000);
});
