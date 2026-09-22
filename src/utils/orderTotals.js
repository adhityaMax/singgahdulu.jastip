export function getOrderItems(order) {
  return Array.isArray(order.items) && order.items.length
    ? order.items
    : [{ item: order.item || '', variant: '', store: order.store || '', price: order.price || 0, fee: order.fee || 0, qty: order.qty || 1 }];
}

export function getOrderTotals(order) {
  return getOrderItems(order).reduce((totals, item) => {
    totals.price += Number(item.price || 0) * Number(item.qty || 0);
    totals.fee += Number(item.fee || 0) * Number(item.qty || 0);
    return totals;
  }, { price: 0, fee: 0 });
}

export function getOrderTotal(order) {
  const { price, fee } = getOrderTotals(order);
  return price + fee;
}
