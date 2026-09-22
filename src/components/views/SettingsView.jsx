import React, { useEffect, useState } from 'react';

export default function SettingsView({ settings, setSettings, triggerToast }) {
  const [form, setForm] = useState(settings);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!logoFile) { setLogoPreview(''); return; }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const saved = await setSettings(form, logoFile);
      setForm(saved);
      setLogoFile(null);
      triggerToast('Pengaturan toko berhasil disimpan');
    }
    catch (error) { triggerToast(error.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="font-bold text-slate-900 text-lg">Pengaturan Identitas Toko & Sosmed</h3>
        <p className="text-xs text-slate-500">Sesuaikan nama usaha, sosial media, dan lokasi pickup di Salatiga</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Nama Usaha Jastip *</label>
          <input
            type="text"
            required
            value={form.storeName}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Username Instagram</label>
            <input
              type="text"
              value={form.ig}
              onChange={(e) => setForm({ ...form, ig: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">No. WhatsApp Official</label>
            <input
              type="text"
              value={form.wa}
              onChange={(e) => setForm({ ...form, wa: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Alamat Titik Ambil / Self Pick-up Salatiga</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="store-logo" className="block font-bold text-slate-700 mb-1">Logo Toko (Opsional)</label>
          <input
            id="store-logo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:outline-none"
          />
          <p className="mt-1 text-slate-500">PNG, JPG, atau WebP; maksimal 2 MB.</p>
          {(logoPreview || form.logoUrl) && <img src={logoPreview || form.logoUrl} alt={logoPreview ? 'Pratinjau logo baru' : 'Logo toko saat ini'} className="mt-3 h-16 w-16 rounded-xl object-cover border border-slate-200" />}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
