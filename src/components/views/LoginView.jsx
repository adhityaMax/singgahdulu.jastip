import React, { useState } from 'react';

export default function LoginView({ onLogin, isSupabaseConfigured, initialError }) {
  const [username, setUsername] = useState(isSupabaseConfigured ? '' : 'admin');
  const [password, setPassword] = useState(isSupabaseConfigured ? '' : 'admin123');
  const [error, setError] = useState(initialError || '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin(username, password);
    } catch (loginError) {
      setError(loginError.message || 'Login gagal. Periksa kembali akun Anda.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center text-xl"><i className="fa-solid fa-motorcycle"></i></div>
          <div><h1 className="text-xl font-black text-slate-900">singgahdulu.jastip</h1><p className="text-xs text-slate-500">Masuk ke ruang operasional</p></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="block text-xs font-bold text-slate-600 mb-1">Username</label><input required autoComplete="username" aria-label="Username" type="text" autoCapitalize="none" spellCheck={false} pattern="[A-Za-z0-9_]{3,40}" title="3-40 huruf, angka, atau underscore" value={username} onChange={(event) => setUsername(event.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600" /></div>
          <div><label className="block text-xs font-bold text-slate-600 mb-1">Password</label><input required autoComplete="current-password" aria-label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600" /></div>
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-3 py-2 text-xs">{error}</div>}
          <button disabled={loading} className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-bold transition">{loading ? 'Memproses...' : 'Masuk'}</button>
        </form>
        {!isSupabaseConfigured && <p className="mt-5 text-[11px] text-slate-500 bg-amber-50 rounded-xl p-3">Mode lokal: admin / admin123</p>}
      </div>
    </main>
  );
}