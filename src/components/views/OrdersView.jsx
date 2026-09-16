import React, { useState, useMemo, useRef } from 'react';
import PaymentConfirmModal from '../modals/PaymentConfirmModal';
import { formatRp } from '../../utils/formatters';

export default function OrdersView({ orders, batches, onEdit, onDelete, onToggleStatus, onOpenNew, onPayOff }) {
  const [payment, setPayment] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const paymentLock = useRef(false);

  const handlePayOff = async () => {
    if (!payment) return;
    const { order } = payment;
    if (paymentLock.current) return;
    paymentLock.current = true;
    setPayingId(order.id);
    setPaymentError('');
    try { await onPayOff(order); setPayment(null); }
    catch (error) { setPaymentError(error.message || 'Pelunasan gagal disimpan. Silakan coba lagi.'); }
    finally { paymentLock.current = false; setPayingId(null); }
  };

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchText =
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.item.toLowerCase().includes(search.toLowerCase()) ||
        o.store.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || o.payStatus === statusFilter;
      return matchText && matchStatus;
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="space-y-6">
      {payment && <PaymentConfirmModal payment={payment} saving={payingId !== null} error={paymentError}
        onCancel={() => { if (!paymentLock.current) setPayment(null); }} onConfirm={handlePayOff} />}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Rekap Pesanan Jastip</h3>
          <p className="text-xs text-slate-500">Kelola pemesan, nominal DP, sisa tagihan, dan sumber dana pembeli</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pemesan, barang, toko..."
            className="px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:outline-none w-48 sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:outline-none bg-white font-medium"
          >
            <option value="ALL">Semua Status Bayar</option>
            <option value="LUNAS">LUNAS</option>
            <option value="DP">DP 50% / Uang Muka</option>
            <option value="BELUM_BAYAR">BELUM BAYAR</option>
          </select>
          <button
            onClick={onOpenNew}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs px-3.5 py-2.5 rounded-xl font-medium transition flex items-center space-x-1.5 shadow-sm"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Tambah Order</span>
          </button>
        </div>
      </div>


      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">ID & Batch</th>
                <th className="py-3.5 px-4">Pemesan / WA</th>
                <th className="py-3.5 px-4">Detail Barang</th>
                <th className="py-3.5 px-4">Toko Tujuan</th>
                <th className="py-3.5 px-4">Total Tagihan</th>
                <th className="py-3.5 px-4">DP Masuk / Sisa</th>
                <th className="py-3.5 px-4">Pembeli (Uang)</th>
                <th className="py-3.5 px-4">Status Belanja</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((o) => {
                const total = (Number(o.price) + Number(o.fee)) * Number(o.qty);
                const remaining = Math.max(0, total - (o.payStatus === 'LUNAS' ? total : o.payStatus === 'DP' ? Number(o.dpAmount || 0) : 0));
                return (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {o.id}
                      <br />
                      <span className="text-[10px] text-teal-700 font-semibold">{o.batchId}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {o.customer}
                      <br />
                      <span className="text-[10px] text-slate-400">{o.phone || '-'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {o.item} <span className="font-extrabold text-teal-700">x{o.qty}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{o.store}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{formatRp(total)}</td>
                    <td className="py-3.5 px-4">
                      {o.payStatus === 'LUNAS' ? (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          LUNAS 100%
                        </span>
                      ) : o.payStatus === 'DP' ? (
                        <div>
                          <span className="text-emerald-700 font-bold">DP: {formatRp(o.dpAmount)}</span>
                          <br />
                          <span className="text-rose-600 text-[10px] font-semibold">
                            Sisa: {formatRp(remaining)}
                          </span>
                        </div>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          BELUM BAYAR
                        </span>
                      )}
                      {o.payStatus !== 'LUNAS' && (
                        <button type="button" disabled={payingId !== null} onClick={() => { setPaymentError(''); setPayment({ order: o, remaining }); }}
                          className="mt-2 flex items-center gap-1.5 rounded-lg bg-teal-700 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-teal-800 disabled:opacity-50 disabled:cursor-wait transition"
                          aria-label={`Lunasi pesanan ${o.customer} sebesar ${formatRp(remaining)}`}>
                          <i aria-hidden="true" className="fa-solid fa-money-bill-wave"></i>
                          {payingId === o.id ? 'Menyimpan...' : 'Lunasi'}
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-800 font-bold px-2 py-1 rounded-md text-[11px]">
                        {o.buyer || 'Umay'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onToggleStatus(o.id)}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold transition ${
                          o.itemStatus === 'DIBELI'
                            ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {o.itemStatus === 'DIBELI' ? '✓ DIBELI' : 'PENDING'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center space-x-1">
                      <button
                        onClick={() => onEdit(o)}
                        className="p-1.5 text-slate-500 hover:text-teal-700 transition"
                        title="Edit order"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button
                        onClick={() => onDelete(o.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                        title="Hapus order"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400">
                    Tidak ada pesanan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
