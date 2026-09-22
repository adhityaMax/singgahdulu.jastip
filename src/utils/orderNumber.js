export function displayOrderNumber(order) {
  return order.orderNo || 'Nomor belum tersedia';
}

// Dipakai hanya saat aplikasi berjalan tanpa Supabase.
export function nextLocalOrderNumber(orders, date) {
  const [, year, month] = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date) || [];
  if (!month || !year) throw new Error('Tanggal pesanan tidak valid.');
  const period = `${month}${year.slice(-2)}`;
  const last = orders.reduce((highest, order) => {
    const match = /^ORD-(\d{4})(\d{4})$/.exec(order.orderNo || '');
    return match?.[2] === period ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  if (last >= 9999) throw new Error('Nomor pesanan bulan ini sudah mencapai batas.');
  return `ORD-${String(last + 1).padStart(4, '0')}${period}`;
}
