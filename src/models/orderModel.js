/**
 * Order Model & Mapper
 */
export function formatOrderFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    batchId: row.batch_id,
    date: row.date,
    customer: row.customer,
    phone: row.phone || '',
    item: row.item,
    store: row.store,
    price: Number(row.price || 0),
    fee: Number(row.fee || 0),
    qty: Number(row.qty || 1),
    payStatus: row.pay_status || 'LUNAS',
    dpAmount: Number(row.dp_amount || 0),
    itemStatus: row.item_status || 'PENDING',
    buyer: row.buyer || 'Umay',
    pickup: row.pickup || 'Self Pick-up',
  };
}

export function formatOrderToDb(order) {
  return {
    id: order.id,
    batch_id: order.batchId,
    date: order.date,
    customer: order.customer,
    phone: order.phone || '',
    item: order.item,
    store: order.store,
    price: order.price,
    fee: order.fee,
    qty: order.qty,
    pay_status: order.payStatus,
    dp_amount: order.dpAmount || 0,
    item_status: order.itemStatus,
    buyer: order.buyer || 'Umay',
    pickup: order.pickup || 'Self Pick-up',
  };
}
