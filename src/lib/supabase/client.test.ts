import test from 'node:test';
import assert from 'node:assert/strict';

test('createClient does not throw when Supabase env vars are missing', async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = '';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

  const { createClient } = await import('./client');
  const client = createClient();

  assert.ok(client);
  assert.equal(typeof client.auth?.getUser, 'function');
});
