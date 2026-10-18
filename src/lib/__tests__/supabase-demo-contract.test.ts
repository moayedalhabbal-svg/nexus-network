import assert from 'node:assert';
import { createClient } from '../supabase/server';

async function runTests() {
  const supabase = await createClient();

  const mutation = supabase.from('profiles').update({ full_name: 'Demo User' }).eq('id', 'user-1');
  assert.strictEqual(typeof (mutation as { then?: unknown }).then, 'function', 'Demo mutation chain should expose a then() method for compatibility with Supabase promise patterns');

  const result = await Promise.resolve(mutation);
  assert.deepStrictEqual(result.error, null);

  const query = supabase.from('profiles').select('*').eq('id', 'user-1');
  assert.strictEqual(typeof (query as { then?: unknown }).then, 'function', 'Demo query chain should expose a then() method for compatibility with Supabase promise patterns');

  const queryResult = await Promise.resolve(query);
  assert.deepStrictEqual(queryResult.error, null);

  console.log('✅ Demo Supabase contract tests passed');
}

runTests().catch((error) => {
  console.error(error);
  process.exit(1);
});
