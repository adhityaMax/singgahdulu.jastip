import test from 'node:test';
import assert from 'node:assert/strict';
import { displayOrderNumber, nextLocalOrderNumber } from '../src/utils/orderNumber.js';

test('nomor tampil memakai urutan empat digit dan bulan tahun', () => {
  const orders = [{ id: 'ORD-uuid-lama', orderNo: 'ORD-00010926' }];
  assert.equal(nextLocalOrderNumber(orders, '2026-09-22'), 'ORD-00020926');
  assert.equal(nextLocalOrderNumber(orders, '2026-10-01'), 'ORD-00011026');
  assert.equal(displayOrderNumber(orders[0]), 'ORD-00010926');
  assert.equal(orders[0].id, 'ORD-uuid-lama');
});
