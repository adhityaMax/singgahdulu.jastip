import React, { useState } from 'react';
import { formatRp } from '../../utils/formatters';

export default function SettlementModal({ partner, batchName, maxAmount, onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const persist = async (data) => {
    if (saving) return;
    setSaving(true); setSaveError('');
    try { await onSave(data); } catch (error) { setSaveError(error.message || 'Gagal menyimpan data.'); }
    finally { setSaving(false); }
  };
  const [formData, setFormData] = useState({ amount: maxAmount, source: 'Kas Jastip', note: '' });

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Catat Pelunasan Talangan</h3>
            <p className="text-[11px] text-slate-500 mt-1">{partner} • {batchName}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); persist(formData); }} className="mt-4 space-y-4 text-xs">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-amber-900">
            Sisa yang perlu dikembalikan: <strong>{formatRp(maxAmount)}</strong>
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Nominal Pelunasan (Rp) *</label>
            <input type="number" required min="1" max={maxAmount} value={formData.amount} onFocus={(event) => event.target.select()} onChange={(event) => setFormData({ ...formData, amount: event.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none" />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Dibayar Dari</label>
            <select value={formData.source} onChange={(event) => setFormData({ ...formData, source: event.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white">
              <option>Kas Jastip</option><option>Transfer Partner</option><option>Uang Tunai</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Catatan</label>
            <input type="text" placeholder="Contoh: transfer setelah order lunas" value={formData.note} onChange={(event) => setFormData({ ...formData, note: event.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Batal</button>
            <button disabled={saving} type="submit" className="px-4 py-2 font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl">Simpan Pelunasan</button>
          </div>
        {saveError && <p role="alert" className="text-rose-700">{saveError}</p>}
        </form>
      </div>
    </div>
  );
}