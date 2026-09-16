import React from 'react';

  export default function BatchesView({ batches, setBatches, onOpenModal, onEdit, onDelete, onSelectBatch, triggerToast }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Daftar Batch Trip Jastip</h3>
          <p className="text-xs text-slate-500">Kelola kuota, tanggal cutoff, dan status perjalanan antarkota</p>
        </div>
        <button
          onClick={onOpenModal}
          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm"
        >
          <i className="fa-solid fa-plus"></i>
          <span>Buat Batch Trip Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {batches.map((b) => (
          <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] bg-slate-100 font-mono font-bold text-slate-500 px-2 py-0.5 rounded">
                  {b.id}
                </span>
                <h4 className="font-black text-slate-900 text-base mt-1">{b.name}</h4>
                <p className="text-xs text-teal-700 font-semibold">{b.route}</p>
              </div>
              <select
                value={b.status}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  try { await setBatches(batches.map((x) => (x.id === b.id ? { ...x, status: newStatus } : x)));
                  triggerToast(`Status ${b.id} diubah ke ${newStatus}`); } catch (error) { triggerToast(error.message, 'error'); }
                }}
                className={`text-xs font-bold px-2.5 py-1 rounded-full focus:outline-none border-0 ${
                  b.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : b.status === 'UPCOMING'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                <option value="ACTIVE">ACTIVE (Buka PO)</option>
                <option value="UPCOMING">UPCOMING</option>
                <option value="CLOSED">CLOSED (Tutup PO)</option>
                <option value="COMPLETED">COMPLETED (Selesai)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Tanggal Cutoff PO</span>
                <span className="font-semibold text-slate-800">{b.cutoffDate || '-'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Estimasi Tiba Salatiga</span>
                <span className="font-semibold text-slate-800">{b.arrivalDate || '-'}</span>
              </div>
            </div>

            {b.notes && <p className="text-xs text-slate-500 bg-teal-50/60 p-2.5 rounded-xl italic">{b.notes}</p>}

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => onSelectBatch(b.id)}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
              >
                <span>Pilih Batch Ini Untuk Kelola Order</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onEdit(b)}
                  className="text-xs font-bold text-slate-500 hover:text-teal-700 flex items-center gap-1"
                  title="Edit batch"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(b)}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1"
                  title="Hapus batch"
                >
                  <i className="fa-solid fa-trash"></i>
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
