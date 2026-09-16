import React from 'react';
import { formatRp } from '../../utils/formatters';

export default function ExpensesView({ expenses, batches, onDelete, onOpenNew }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Catatan Pengeluaran Operasional</h3>
          <p className="text-xs text-slate-500">Bensin motor, packing, parkir, & konsumsi selama perjalanan</p>
        </div>
        <button
          onClick={onOpenNew}
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-4 py-2.5 rounded-xl font-medium transition flex items-center space-x-1.5 shadow-sm"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Tambah Biaya</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Batch</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Catatan Detail</th>
                <th className="py-3.5 px-4">Nominal</th>
                <th className="py-3.5 px-4">Dibayar Oleh</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-600">{e.date}</td>
                  <td className="py-3 px-4 font-medium text-slate-600">
                    {batches.find((batch) => batch.id === e.batchId)?.name || e.batchId || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-amber-50 text-amber-800 text-[10px] px-2.5 py-1 rounded-full font-bold">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-800">{e.note || '-'}</td>
                  <td className="py-3 px-4 font-extrabold text-rose-600">{formatRp(e.amount)}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold text-[11px]">
                      {e.paidBy || 'Kas Jastip'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onDelete(e.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Hapus biaya"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    Belum ada pengeluaran operasional dicatat.
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
