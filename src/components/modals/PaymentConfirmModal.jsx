import React, { useEffect, useRef } from 'react';
import { formatRp } from '../../utils/formatters';

export default function PaymentConfirmModal({ payment, saving, error, onCancel, onConfirm }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog ref={dialogRef} aria-labelledby="payment-confirm-title" aria-describedby="payment-confirm-description"
      onCancel={(event) => { event.preventDefault(); if (!saving) onCancel(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm">
      <div className="p-6 sm:p-7">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-teal-700">
          <i aria-hidden="true" className="fa-solid fa-money-bill-wave"></i>
        </div>
        <h3 id="payment-confirm-title" className="text-xl font-extrabold text-slate-900">Konfirmasi pelunasan</h3>
        <p id="payment-confirm-description" className="mt-2 text-sm leading-relaxed text-slate-500">Pastikan pembayaran sudah diterima sebelum melunasi pesanan ini.</p>
        <div className="my-6 rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
          <p className="text-xs font-semibold text-teal-700">Pembayaran diterima</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-teal-800">{formatRp(payment.remaining)}</p>
          <div className="mt-4 border-t border-teal-100 pt-3">
            <p className="break-words text-sm font-bold text-slate-900">{payment.order.customer}</p>
            <p className="mt-1 break-words text-xs text-slate-500">{payment.order.item} &times; {payment.order.qty}</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">Status berubah menjadi <strong className="text-teal-700">LUNAS</strong>. Kas masuk dan sisa piutang akan diperbarui setelah pembayaran tersimpan.</p>
        {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button autoFocus type="button" disabled={saving} onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Batal</button>
          <button type="button" disabled={saving} onClick={onConfirm} className="flex-[2] rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">
            {saving ? 'Menyimpan...' : 'Konfirmasi Pelunasan'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
