import React from 'react';

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center space-x-2 animate-bounce text-xs font-semibold">
      <i className={`fa-solid ${toast.type === 'error' ? 'fa-circle-exclamation text-rose-400' : 'fa-circle-check text-emerald-400'}`}></i>
      <span>{toast.msg}</span>
    </div>
  );
}
