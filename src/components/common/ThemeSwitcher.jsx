import React, { useEffect, useState } from 'react';

const KEY = 'singgahdulu_theme';
const CHOICES = [
  { value: 'light', label: 'Light', icon: 'fa-sun' },
  { value: 'dark', label: 'Dark', icon: 'fa-moon' },
  { value: 'system', label: 'System', icon: 'fa-desktop' },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(KEY);
    return CHOICES.some(choice => choice.value === saved) ? saved : 'system';
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      document.documentElement.dataset.theme = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
    };
    applyTheme();
    media.addEventListener('change', applyTheme);
    localStorage.setItem(KEY, theme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  return <div className="fixed bottom-5 right-5 z-[60]">
    {open && <div role="group" aria-label="Pengaturan tema" className="mb-3 w-48 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-800">Ganti Tema</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Tutup pengaturan tema" className="text-slate-500 hover:text-slate-900"><i className="fa-solid fa-xmark" /></button>
      </div>
      <div className="space-y-1">
        {CHOICES.map(choice => <button key={choice.value} type="button" onClick={() => { setTheme(choice.value); setOpen(false); }} aria-pressed={theme === choice.value} className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold ${theme === choice.value ? 'bg-teal-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
          <i className={`fa-solid ${choice.icon} w-4`} />{choice.label}{theme === choice.value && <i className="fa-solid fa-check ml-auto" />}
        </button>)}
      </div>
    </div>}
    <button type="button" onClick={() => setOpen(value => !value)} aria-label="Pengaturan tampilan" aria-expanded={open} className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
      <i className="fa-solid fa-gear text-lg" />
    </button>
  </div>;
}
