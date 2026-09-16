import { createClient } from '@supabase/supabase-js';

// Run locally only. Never expose the service role key through VITE_* variables.
const username = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const existingId = process.env.ADMIN_EXISTING_USER_ID;

try {
  if (!url || !key) throw new Error('Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.admin.');
  if (!/^[a-z0-9_]{3,40}$/.test(username)) throw new Error('Username harus 3?40 huruf, angka, atau underscore.');
  if (!password || password.length < 8) throw new Error('Isi ADMIN_PASSWORD minimal 8 karakter.');
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: role, error: roleError } = await client.from('roles').select('id').eq('name', 'admin').single();
  if (roleError) throw roleError;
  const { data: profile, error: profileError } = await client.from('profiles').select('id, username').eq('username', username).maybeSingle();
  if (profileError) throw profileError;
  if (profile && profile.id !== existingId) throw new Error('Username sudah ada. Akun tidak diubah.');
  const attributes = {
    email: `${username}@users.singgahdulu.invalid`, password, email_confirm: true,
    user_metadata: { name: process.env.ADMIN_NAME || 'Administrator' },
  };
  const { data, error } = existingId
    ? await client.auth.admin.updateUserById(existingId, attributes)
    : await client.auth.admin.createUser(attributes);
  if (error) throw error;
  const { error: updateError } = await client.from('profiles').upsert({
    id: data.user.id, name: attributes.user_metadata.name, username, role_id: role.id,
  });
  if (updateError) throw new Error(`Akun Auth tersedia (${data.user.id}), tetapi profil gagal diperbarui: ${updateError.message}. Isi ADMIN_EXISTING_USER_ID dengan ID tersebut untuk mencoba kembali.`);
  console.log(`Admin siap. Login dengan username: ${username} dan password yang Anda isi.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
