import test from 'node:test';
import assert from 'node:assert/strict';
import { formatOrderFromDb, formatOrderToDb } from '../src/models/orderModel.js';

test('pesanan disimpan dan dibaca melalui items tanpa kolom barang lama', () => {
  const items = [{ item: 'Kopi', variant: 'Besar', store: 'Toko A', price: 10000, fee: 2000, qty: 2 }];
  const payload = formatOrderToDb({ id: 'ORD-1', orderNo: 'ORD-00010926', batchId: 'BATCH-1', date: '2026-09-22', customer: 'Ani', items, payStatus: 'BELUM_BAYAR', itemStatus: 'PENDING' });
  for (const column of ['item', 'store', 'price', 'fee', 'qty']) assert.equal(Object.hasOwn(payload, column), false);
  assert.deepEqual(payload.items, items);
  assert.equal(Object.hasOwn(payload, 'order_no'), false);
  assert.deepEqual(formatOrderFromDb({ ...payload, order_no: 'ORD-00010926' }).items, items);
  assert.equal(formatOrderFromDb({ ...payload, order_no: 'ORD-00010926' }).orderNo, 'ORD-00010926');
});
