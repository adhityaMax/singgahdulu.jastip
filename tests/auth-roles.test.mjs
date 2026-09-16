import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function authWithProfile(profile, error = null) {
  const source = await readFile(new URL('../src/services/authService.js', import.meta.url), 'utf8');
  const mock = `
    const isSupabaseConfigured = true;
    const supabase = {
      auth: { getUser: async () => ({ data: { user: { id: 'user-1', email: 'test@example.com' } } }) },
      from: () => ({ select: (columns) => {
        if (columns !== 'name, username, role_id, roles(name)') throw new Error('Missing role join');
        return { eq: () => ({ maybeSingle: async () => (${JSON.stringify({ data: profile, error })}) }) };
      } })
    };
  `;
  return import('data:text/javascript;base64,' + Buffer.from(mock + source.replace(/^import .*;\r?\n/gm, '')).toString('base64'));
}

for (const role of ['admin', 'koordinator', 'driver']) {
  test(`login resolves ${role} from joined role, preserving foreign key`, async () => {
    const auth = await authWithProfile({ name: 'Test', role_id: 42, roles: { name: role } });
    const user = await auth.getCurrentAuthUser();
    assert.equal(user.roleId, 42);
    assert.equal(user.role, role);
  });
}

test('missing role relation prevents login instead of assigning a fallback role', async () => {
  const auth = await authWithProfile({ name: 'Test', role_id: 42, roles: null });
  await assert.rejects(auth.getCurrentAuthUser(), /Role pengguna belum tersedia/);
});

test('database join failures propagate', async () => {
  const auth = await authWithProfile(null, { message: 'Relationship not found' });
  await assert.rejects(auth.getCurrentAuthUser(), { message: 'Relationship not found' });
});
