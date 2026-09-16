import { fetchOrdersFromSupabase, upsertOrderToSupabase, deleteOrderFromSupabase } from '../services/orderService';
import { DEFAULT_ORDERS } from '../data/dummyData';

export async function fetchOrdersController() {
  const remoteOrders = await fetchOrdersFromSupabase();
  if (remoteOrders !== null) {
    localStorage.setItem('singgahdulu_orders', JSON.stringify(remoteOrders));
    return remoteOrders;
  }

  const saved = localStorage.getItem('singgahdulu_orders');
  return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
}

export async function saveOrdersLocalController(orders) {
  localStorage.setItem('singgahdulu_orders', JSON.stringify(orders));
}

export async function saveOrderController(order) {
  await upsertOrderToSupabase(order);
}

export async function deleteOrderController(id) {
  await deleteOrderFromSupabase(id);
}
