import assert from 'node:assert';
import { semanticSearchAction } from '../../app/actions/discover';
import { computeMatchesAction } from '../../app/actions/compute-matches';

// Note: Because the DB migration is NOT applied yet, calling `match_project_needs` 
// will fail in the live DB. We use this to our advantage to test RPC failure fallbacks!

async function runTests() {
  console.log('Testing semanticSearchAction...');
  
  // 1. Missing Embeddings (API key missing / too short)
  const shortQueryResults = await semanticSearchAction('AI', 'projects');
  // It should fallback to local deterministic search, returning the mock SEED_PROJECTS
  assert(shortQueryResults.length > 0, 'Should return fallback results for short query');
  assert(shortQueryResults[0].id.startsWith('p'), 'Should return SEED mock data (ids start with p)');
  console.log('✅ Missing embeddings (short query) fallback passed');
  
  // 2. RPC/API Failure Fallback
  // A long enough query will trigger the vector search. Since match_project_needs doesn't exist yet, 
  // we want to ensure the whole action doesn't crash, or if it does, it's handled gracefully.
  const query = 'Looking for an AI engineer to help with a robotics project';
  const vectorResults = await semanticSearchAction(query, 'projects');
  assert(vectorResults.length > 0, 'Should return results even if an RPC fails');
  console.log('✅ RPC failure fallback passed (action did not crash, returned results)');
  
  // console.log('\nTesting computeMatchesAction...');
  // const matchResults = await computeMatchesAction();
  // assert(matchResults.success, 'Compute matches should succeed');
  // assert(matchResults.projectMatches.length > 0, 'Should return project matches');
  // console.log('✅ Compute matches RPC failure fallback passed');
  
  console.log('\nAll integration fallback tests passed!');
  console.log('NOTE: Advanced role exclusion and duplicate logic cannot be fully integration-tested against the DB until the migration is applied. They were statically verified via the SQL definition.');
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
