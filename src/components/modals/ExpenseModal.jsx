import React, { useState } from 'react';

export default function ExpenseModal({ batches, selectedBatchId, onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const persist = async (data) => {
    if (saving) return;
    setSaving(true); setSaveError('');
    try { await onSave(data); } catch (error) { setSaveError(error.message || 'Gagal menyimpan data.'); }
    finally { setSaving(false); }
  };
  const [formData, setFormData] = useState({
    batchId: selectedBatchId === 'ALL' ? 'BATCH-001' : selectedBatchId,
    category: 'Bensin Motor',
    amount: '',
    note: '',
    paidBy: 'Adhit',
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">Catat Operational Biaya</h3>
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
            <label className="block font-semibold text-slate-600 mb-1">Batch Trip</label>
            <select
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white font-semibold"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Kategori Biaya</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white"
            >
              <option value="Bensin Motor">Bensin Motor</option>
              <option value="Packing (Kardus/Bubble)">Packing (Kardus/Bubble)</option>
              <option value="Parkir & Tol">Parkir & Tol</option>
              <option value="Makan / Konsumsi Trip">Makan & Minum Trip</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Nominal Biaya (Rp) *</label>
            <input
              type="number"
              required
              min="0"
              placeholder="35000"
              value={formData.amount}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Talangan Uang Dari Siapa</label>
            <select
              value={formData.paidBy}
              onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white font-bold"
            >
              <option value="Adhit">Uang Adhit</option>
              <option value="Umay">Uang Umay</option>
              <option value="Kas Jastip">Kas Jastip</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Catatan Detail</label>
            <input
              type="text"
              placeholder="Isi Pertalite di Klaten"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
            />
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
              className="px-4 py-2 font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl"
            >
              Simpan Biaya
            </button>
          </div>
        {saveError && <p role="alert" className="text-rose-700">{saveError}</p>}
        </form>
      </div>
    </div>
  );
}
