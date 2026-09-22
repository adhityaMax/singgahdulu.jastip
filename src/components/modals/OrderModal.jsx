import React, { useState } from 'react';
import { formatRp } from '../../utils/formatters';
import { getOrderItems, getOrderTotal } from '../../utils/orderTotals';

export default function OrderModal({ editingOrder, batches, selectedBatchId, onClose, onSave, confirmDelete }) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const persist = async (data) => {
    if (saving) return;
    setSaving(true); setSaveError('');
    try { await onSave(data); } catch (error) { setSaveError(error.message || 'Gagal menyimpan data.'); }
    finally { setSaving(false); }
  };
  const [formData, setFormData] = useState({
    batchId: editingOrder?.batchId || selectedBatchId || 'BATCH-000',
    customer: editingOrder?.customer || '',
    phone: editingOrder?.phone || '',
    payStatus: editingOrder?.payStatus || 'LUNAS',
    dpAmount: editingOrder?.dpAmount || 0,
    buyer: editingOrder?.buyer || 'Umay',
    pickup: editingOrder?.pickup || 'Self Pick-up',
    itemStatus: editingOrder?.itemStatus || 'PENDING',
    items: editingOrder ? getOrderItems(editingOrder) : [{ item: '', variant: '', store: '', price: 0, fee: 10000, qty: 1 }],
  });

  const subtotal = getOrderTotal(formData);
  const updateItem = (index, field, value) => setFormData(current => ({ ...current,
    items: current.items.map((item, i) => i === index ? { ...item, [field]: value } : item),
  }));
  const save = () => {
    const items = formData.items.map(item => ({ ...item, price: Number(item.price), fee: Number(item.fee), qty: Number(item.qty) }));
    if (items.some(item => !item.item.trim() || !item.store.trim() || !Number.isFinite(item.price) || item.price < 0 || !Number.isFinite(item.fee) || item.fee < 0 || !Number.isInteger(item.qty) || item.qty < 1)) {
      setSaveError('Lengkapi setiap barang dengan harga, fee, dan kuantitas yang valid.'); return;
    }
    if (formData.payStatus === 'DP' && (!Number.isFinite(Number(formData.dpAmount)) || Number(formData.dpAmount) < 0 || Number(formData.dpAmount) > subtotal)) {
      setSaveError('Nominal DP harus antara Rp0 dan total tagihan.'); return;
    }
    persist({ ...formData, items, pickup: formData.pickup.trim(), dpAmount: formData.payStatus === 'DP' ? Number(formData.dpAmount) : 0 });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-slate-200">
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
            save();
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

          {formData.items.map((item, index) => <div key={index} className="rounded-xl border border-slate-200 p-3 space-y-2">
            <div className="flex justify-between font-bold"><span>Barang {index + 1}</span>{formData.items.length > 1 && <button type="button" onClick={async () => { if (await confirmDelete(`Barang ${item.item || index + 1} akan dihapus dari formulir pesanan.`)) setFormData(current => ({ ...current, items: current.items.filter((_, i) => i !== index) })); }} className="text-rose-600">Hapus</button>}</div>
            <div className="grid grid-cols-2 gap-2">
              <input required placeholder="Nama barang *" aria-label={`Nama barang ${index + 1}`} value={item.item} onChange={e => updateItem(index, 'item', e.target.value)} className="px-3 py-2 border rounded-xl" />
              <input placeholder="Varian / ukuran" aria-label={`Varian barang ${index + 1}`} value={item.variant || ''} onChange={e => updateItem(index, 'variant', e.target.value)} className="px-3 py-2 border rounded-xl" />
              <input required placeholder="Toko tujuan *" aria-label={`Toko barang ${index + 1}`} value={item.store} onChange={e => updateItem(index, 'store', e.target.value)} className="px-3 py-2 border rounded-xl col-span-2" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label>Harga toko *<input required type="number" min="0" value={item.price} onChange={e => updateItem(index, 'price', e.target.value)} className="w-full px-2 py-2 border rounded-xl" /></label>
              <label>Fee jastip *<input required type="number" min="0" value={item.fee} onChange={e => updateItem(index, 'fee', e.target.value)} className="w-full px-2 py-2 border rounded-xl" /></label>
              <label>Qty *<input required type="number" min="1" step="1" value={item.qty} onChange={e => updateItem(index, 'qty', e.target.value)} className="w-full px-2 py-2 border rounded-xl" /></label>
            </div>
          </div>)}
          <button type="button" onClick={() => setFormData(current => ({ ...current, items: [...current.items, { item: '', variant: '', store: '', price: 0, fee: 10000, qty: 1 }] }))} className="font-bold text-teal-700">+ Tambah barang</button>

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
              <label className="block font-semibold text-slate-600 mb-1">Metode pengantaran / alamat / lokasi COD</label>
              <input type="text"
                value={formData.pickup}
                onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white"
              />
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
