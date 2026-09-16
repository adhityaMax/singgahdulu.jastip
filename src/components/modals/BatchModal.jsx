import React, { useState } from 'react';

export default function BatchModal({ editingBatch, onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const persist = async (data) => {
    if (saving) return;
    setSaving(true); setSaveError('');
    try { await onSave(data); } catch (error) { setSaveError(error.message || 'Gagal menyimpan data.'); }
    finally { setSaving(false); }
  };
  const [formData, setFormData] = useState(editingBatch || {
    name: '',
    route: 'Jogja ➔ Salatiga',
    cutoffDate: '',
    arrivalDate: '',
    status: 'ACTIVE',
    notes: '',
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">{editingBatch ? 'Edit Batch Trip' : 'Buat Batch Trip Baru'}</h3>
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
            <label className="block font-semibold text-slate-600 mb-1">Nama Batch *</label>
            <input
              type="text"
              required
              placeholder="Batch #3 - Surabaya ➔ Salatiga"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Status Batch</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
            >
              <option value="ACTIVE">ACTIVE (Buka PO)</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="CLOSED">CLOSED (Tutup PO)</option>
              <option value="COMPLETED">COMPLETED (Selesai)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Rute Perjalanan *</label>
            <input
              type="text"
              required
              placeholder="Surabaya ➔ Salatiga"
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Tanggal Cutoff PO</label>
              <input
                type="date"
                value={formData.cutoffDate}
                onChange={(e) => setFormData({ ...formData, cutoffDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Tiba di Salatiga</label>
              <input
                type="date"
                value={formData.arrivalDate}
                onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Catatan Khusus Batch</label>
            <input
              type="text"
              placeholder="Spesial Spikoe & Bandeng"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              className="px-4 py-2 font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl"
            >
              {editingBatch ? 'Simpan Perubahan' : 'Buat Batch'}
            </button>
          </div>
        {saveError && <p role="alert" className="text-rose-700">{saveError}</p>}
        </form>
      </div>
    </div>
  );
}
