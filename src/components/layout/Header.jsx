import React from 'react';

export default function Header({ settings, batches, selectedBatchId, sidebarOpen, setSidebarOpen }) {
  return (
    <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-900 text-sm">
          <i className="fa-solid fa-motorcycle"></i>
        </div>
        <div>
          <h1 className="font-extrabold text-sm tracking-tight">{settings.storeName}</h1>
          <p className="text-[10px] text-teal-400">Batch: {selectedBatchId === 'ALL' ? 'Semua Batch' : batches.find(batch => batch.id === selectedBatchId)?.name || 'Batch tidak ditemukan'}</p>
        </div>
      </div>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 text-slate-300 hover:text-white"
        aria-label="Toggle navigation menu"
      >
        <i className={`fa-solid ${sidebarOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
      </button>
    </div>
  );
}
