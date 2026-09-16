import React, { useState, useMemo } from 'react';
import { formatRp } from '../../utils/formatters';

export default function ReceiptView({ orders, settings }) {
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');

  const order = useMemo(() => orders.find((o) => o.id === selectedOrderId), [orders, selectedOrderId]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Cetak Struk / Nota Jastip</h3>
          <p className="text-xs text-slate-500">Pilih pemesan untuk menampilkan preview nota thermal printer</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none bg-white font-semibold"
          >
            <option value="">-- Pilih Order Pemesan --</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} - {o.customer} ({o.item})
              </option>
            ))}
          </select>
          <button
            onClick={() => window.print()}
            className="bg-teal-700 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-teal-800 transition flex items-center space-x-1.5 shadow-sm"
          >
            <i className="fa-solid fa-print"></i>
            <span>Cetak Struk</span>
          </button>
        </div>
      </div>

      {order ? (
        <div className="flex justify-center bg-slate-200/60 p-6 sm:p-10 rounded-2xl">
          <div className="print-area bg-white p-6 rounded-lg shadow-lg border border-slate-300 w-full max-w-xs font-mono text-xs space-y-4">
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h4 className="font-black text-sm uppercase tracking-wider text-slate-900">{settings.storeName}</h4>
              <p className="text-[10px] text-slate-500">{settings.ig} | WA: {settings.wa}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{settings.address}</p>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>No. Order:</span> <span className="font-bold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span> <span>{order.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Pemesan:</span> <span className="font-bold">{order.customer}</span>
              </div>
              <div className="flex justify-between">
                <span>Pickup:</span> <span>{order.pickup}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-900">
                <span>
                  {order.item} x{order.qty}
                </span>
                <span>{formatRp(order.price * order.qty)}</span>
              </div>
              <div className="text-[10px] text-slate-500">Toko: {order.store}</div>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Harga Barang:</span>
                <span>{formatRp(order.price * order.qty)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee Jastip:</span>
                <span>{formatRp(order.fee * order.qty)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-slate-200">
                <span>TOTAL TAGIHAN:</span>
                <span>{formatRp((order.price + order.fee) * order.qty)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Status Bayar:</span>
                <span className="font-bold">{order.payStatus}</span>
              </div>
            </div>

            <div className="text-center border-t border-dashed border-slate-300 pt-3 text-[10px] text-slate-500 space-y-0.5">
              <p>Terima kasih nitip di {settings.storeName}! ✨</p>
              <p>Titipan aman, perut kenyang.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
          Silakan pilih order terlebih dahulu di atas.
        </div>
      )}
    </div>
  );
}
