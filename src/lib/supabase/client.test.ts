import test from 'node:test';
import assert from 'node:assert/strict';

test('createClient does not throw when Supabase env vars are missing', async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = '';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

  const { createClient } = await import('./client');
  const client = createClient();

  assert.ok(client);
  assert.equal(typeof client.auth?.getUser, 'function');
  assert.equal(typeof client.from, 'function');
  assert.equal(typeof client.rpc, 'function');
  assert.equal(typeof client.storage?.from, 'function');

  const query = client.from('posts').select('*').order('created_at', { ascending: false }).range(0, 9);
  const result = await query;
  assert.deepEqual(result.error, null);
  assert.deepEqual(result.data, []);

  const inserted = await client.from('posts').insert({ content: 'hello' }).select().single();
  assert.equal(inserted.error, null);
  assert.ok(inserted.data);
});
