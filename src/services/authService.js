import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

const LOCAL_USER = {
  id: 'local-admin',
  username: 'admin',
  name: 'Admin Singgahdulu',
  role: 'admin',
};

export async function getCurrentAuthUser() {
  if (!isSupabaseConfigured || !supabase) {
    const localSession = localStorage.getItem('singgahdulu_session');
    return localSession ? JSON.parse(localSession) : null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getProfileForUser(user);
}

async function getProfileForUser(user) {
  const { data: profile, error: profileError } = await supabase.from('profiles').select('name, username, role_id, roles(name)').eq('id', user.id).maybeSingle();
  if (profileError) throw profileError;
  if (!profile) throw new Error('Profil pengguna belum tersedia. Jalankan SQL database terlebih dahulu.');
  if (!profile.roles?.name) throw new Error('Role pengguna belum tersedia. Jalankan migrasi role database.');
  return { id: user.id, username: profile.username, name: profile.name || profile.username, roleId: profile.role_id, role: profile.roles.name };
}

export async function signIn(username, password) {
  username = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,40}$/.test(username)) throw new Error('Username harus 3-40 huruf, angka, atau underscore.');
  if (!isSupabaseConfigured || !supabase) {
    if (username === LOCAL_USER.username && password === 'admin123') {
      localStorage.setItem('singgahdulu_session', JSON.stringify(LOCAL_USER));
      return LOCAL_USER;
    }
    throw new Error('Username atau password lokal salah. Gunakan admin / admin123.');
  }

  const { error } = await supabase.auth.signInWithPassword({ email: `${username}@users.singgahdulu.invalid`, password });
  if (error) throw new Error(error.code === 'invalid_credentials' ? 'Username atau password salah.' : error.message);
  const user = await getCurrentAuthUser();
  if (!user) throw new Error('Sesi login tidak tersedia. Silakan coba lagi.');
  return user;
}

export async function signOut() {
  localStorage.removeItem('singgahdulu_session');
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

export function subscribeToAuthChanges(onChange, onError = () => {}) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  let active = true;
  let timer;
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    clearTimeout(timer);
    if (event === 'SIGNED_OUT' || !session?.user) { onChange(null); return; }
    timer = setTimeout(() => {
      getProfileForUser(session.user).then(user => { if (active) onChange(user); })
        .catch(error => { if (active) { onChange(null); onError(error); } });
    }, 0);
  });
  return () => { active = false; clearTimeout(timer); subscription.unsubscribe(); };
}
