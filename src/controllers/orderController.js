import { fetchOrdersFromSupabase, upsertOrderToSupabase, deleteOrderFromSupabase } from '../services/orderService';
import { DEFAULT_ORDERS } from '../data/dummyData';
import { nextLocalOrderNumber } from '../utils/orderNumber';

export async function fetchOrdersController() {
  const remoteOrders = await fetchOrdersFromSupabase();
  if (remoteOrders !== null) {
    localStorage.setItem('singgahdulu_orders', JSON.stringify(remoteOrders));
    return remoteOrders;
  }

  const saved = localStorage.getItem('singgahdulu_orders');
  const orders = saved ? JSON.parse(saved) : DEFAULT_ORDERS.map(order => ({ ...order }));
  for (const order of [...orders].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))) {
    if (!order.orderNo) order.orderNo = nextLocalOrderNumber(orders, order.date);
  }
  localStorage.setItem('singgahdulu_orders', JSON.stringify(orders));
  return orders;
}

export async function saveOrdersLocalController(orders) {
  localStorage.setItem('singgahdulu_orders', JSON.stringify(orders));
}

export async function saveOrderController(order) {
  return await upsertOrderToSupabase(order);
}

export async function deleteOrderController(id) {
  await deleteOrderFromSupabase(id);
}
