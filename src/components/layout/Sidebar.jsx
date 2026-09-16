import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({
  settings,
  batches,
  selectedBatchId,
  setSelectedBatchId,
  sidebarOpen,
  setSidebarOpen,
  filteredOrdersCount,
  currentUser,
  onLogout,
  loggingOut,
}) {
  const getNavClass = ({ isActive }) =>
    `w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition ${
      isActive
        ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
        : 'hover:bg-slate-800 text-slate-300'
    }`;

  const getAiNavClass = ({ isActive }) =>
    `w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition ${
      isActive
        ? 'bg-indigo-600 text-white font-bold shadow-sm'
        : 'hover:bg-slate-800 text-indigo-400'
    }`;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 h-dvh bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-slate-800 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="flex-1 min-h-0 p-5 space-y-6 overflow-y-auto">
        {/* Brand & Logo Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-md overflow-hidden">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <i className="fa-solid fa-motorcycle"></i>
            )}
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-tight">{settings.storeName}</h1>
            <p className="text-[11px] text-teal-400 font-semibold">{settings.ig}</p>
          </div>
        </div>

        {/* Batch Selector Dropdown in Sidebar */}
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <i className="fa-solid fa-layer-group text-teal-400 mr-1"></i> Pilih Batch Trip
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full bg-slate-900 text-white text-xs font-semibold py-2 px-2.5 rounded-lg border border-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="ALL">Semua Batch (Total)</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.status})
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Folder Menu */}
        <nav className="space-y-4 text-xs">
          {/* Folder 1: Utama */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Kilas Utama</span>
            <div className="mt-1 space-y-1">
              <NavLink
                to="/"
                onClick={() => setSidebarOpen(false)}
                className={getNavClass}
                end
              >
                <i className="fa-solid fa-chart-pie w-4 text-center"></i>
                <span>Dashboard Ringkasan</span>
              </NavLink>
            </div>
          </div>

          {/* Folder 2: Operasional Belanja */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Operasional</span>
            <div className="mt-1 space-y-1">
              <NavLink
                to="/batches"
                onClick={() => setSidebarOpen(false)}
                className={getNavClass}
              >
                <i className="fa-solid fa-calendar-days w-4 text-center"></i>
                <span>Kelola Batch Trip</span>
              </NavLink>
              <NavLink
                to="/orders"
                onClick={() => setSidebarOpen(false)}
                className={getNavClass}
              >
                <i className="fa-solid fa-list-check w-4 text-center"></i>
                <span>Rekap Pesanan ({filteredOrdersCount})</span>
              </NavLink>
              <NavLink
                to="/shopping"
                onClick={() => setSidebarOpen(false)}
                className={getNavClass}
              >
                <i className="fa-solid fa-store w-4 text-center"></i>
                <span>Checklist Belanja Toko</span>
              </NavLink>
            </div>
          </div>

          {/* Folder 3: Keuangan & Bagi Hasil */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Keuangan & Partner</span>
            <div className="mt-1 space-y-1">
              <NavLink
                to="/expenses"
                onClick={() => setSidebarOpen(false)}
                className={getNavClass}
              >
                <i className="fa-solid fa-receipt w-4 text-center"></i>
                <span>Catatan Operasional</span>
              </NavLink>
              <NavLink
                to="/settlement"
                onClick={() => setSidebarOpen(false)}
                className={getNavClass}
              >
                <i className="fa-solid fa-hand-holding-dollar w-4 text-center"></i>
                <span>Bagi Hasil (Umay & Adhit)</span>
              </NavLink>
              <NavLink
                to="/receipt"
                onClick={() => setSidebarOpen(false)}
                className={getNavClass}
              >
                <i className="fa-solid fa-print w-4 text-center"></i>
                <span>Cetak Nota Pembeli</span>
              </NavLink>
            </div>
          </div>

          {/* Folder 4: AI & Setting */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Sistem & AI</span>
            <div className="mt-1 space-y-1">
              <NavLink
                to="/ai-tools"
                onClick={() => setSidebarOpen(false)}
                className={getAiNavClass}
              >
                <i className="fa-solid fa-wand-magic-sparkles w-4 text-center"></i>
                <span>Fitur AI Intelligence</span>
              </NavLink>
              <NavLink
                to="/settings"
                onClick={() => setSidebarOpen(false)}
                className={getNavClass}
              >
                <i className="fa-solid fa-gear w-4 text-center"></i>
                <span>Pengaturan Toko</span>
              </NavLink>
            </div>
          </div>
        </nav>
      </div>

      {/* Sidebar Footer User Tag */}
      <div className="shrink-0 p-4 border-t border-slate-800 bg-slate-900 flex items-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div aria-hidden="true" className="w-9 h-9 shrink-0 rounded-full bg-teal-500/15 text-teal-300 flex items-center justify-center text-sm font-bold">
          {(currentUser?.name || currentUser?.username || 'U').slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white" title={currentUser?.name || currentUser?.username}>{currentUser?.name || currentUser?.username || 'Pengelola'}</p>
          <p className="text-[11px] text-slate-400 capitalize">{currentUser?.role || 'user'}</p>
        </div>
        <button type="button" onClick={onLogout} disabled={loggingOut} title="Logout" aria-label="Logout" className="shrink-0 p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-rose-300 disabled:opacity-50 disabled:cursor-wait transition">
          <i aria-hidden="true" className={`fa-solid ${loggingOut ? 'fa-spinner fa-spin' : 'fa-right-from-bracket'}`}></i>
        </button>
      </div>
    </aside>
  );
}
