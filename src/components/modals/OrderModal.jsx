import React, { useState } from 'react';
import { formatRp } from '../../utils/formatters';

export default function OrderModal({ editingOrder, batches, selectedBatchId, onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const persist = async (data) => {
    if (saving) return;
    setSaving(true); setSaveError('');
    try { await onSave(data); } catch (error) { setSaveError(error.message || 'Gagal menyimpan data.'); }
    finally { setSaving(false); }
  };
  const [formData, setFormData] = useState({
    batchId: editingOrder?.batchId || selectedBatchId || 'BATCH-001',
    customer: editingOrder?.customer || '',
    phone: editingOrder?.phone || '',
    item: editingOrder?.item || '',
    store: editingOrder?.store || '',
    price: editingOrder?.price || 0,
    fee: editingOrder?.fee || 10000,
    qty: editingOrder?.qty || 1,
    payStatus: editingOrder?.payStatus || 'LUNAS',
    dpAmount: editingOrder?.dpAmount || 0,
    buyer: editingOrder?.buyer || 'Umay',
    pickup: editingOrder?.pickup || 'Self Pick-up',
    itemStatus: editingOrder?.itemStatus || 'PENDING',
  });

  const subtotal = (Number(formData.price) + Number(formData.fee)) * Number(formData.qty);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">
            {editingOrder ? 'Edit Pesanan Jastip' : 'Input Pesanan Jastip Baru'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            persist(formData);
          }}
          className="mt-4 space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Batch Trip *</label>
            <select
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white font-semibold"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Nama Pemesan *</label>
              <input
                type="text"
                required
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">No. WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Nama Barang *</label>
              <input
                type="text"
                required
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Toko Tujuan *</label>
              <input
                type="text"
                required
                value={formData.store}
                onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Harga Toko (Rp) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Fee Jastip (Rp) *</label>
              <input
                type="number"
                required
                value={formData.fee}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Qty *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600">Total Tagihan Pemesan:</span>
            <span className="font-black text-teal-800 text-sm">{formatRp(subtotal)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Status Pembayaran</label>
              <select
                value={formData.payStatus}
                onChange={(e) => setFormData({ ...formData, payStatus: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white"
              >
                <option value="LUNAS">LUNAS 100%</option>
                <option value="DP">DP (Uang Muka)</option>
                <option value="BELUM_BAYAR">BELUM BAYAR</option>
              </select>
            </div>

            {formData.payStatus === 'DP' && (
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nominal DP Masuk (Rp) *</label>
                <input
                  type="number"
                  required
                  value={formData.dpAmount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setFormData({ ...formData, dpAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Dipelanjakan Menggunakan Uang</label>
              <select
                value={formData.buyer}
                onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white font-bold"
              >
                <option value="Umay">Uang Umay</option>
                <option value="Adhit">Uang Adhit</option>
                <option value="Kas Jastip">Kas Jastip</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Metode Pengambilan</label>
              <select
                value={formData.pickup}
                onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white"
              >
                <option value="Self Pick-up">Self Pick-up Salatiga</option>
                <option value="Gosend / Grab">Kirim Ojol Lokal</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
            disabled={saving}
              className="px-4 py-2 font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl"
            >
              Simpan Pesanan
            </button>
          </div>
        {saveError && <p role="alert" className="text-rose-700">{saveError}</p>}
        </form>
      </div>
    </div>
  );
}
