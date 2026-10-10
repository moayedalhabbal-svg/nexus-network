import { createClient } from "@supabase/supabase-js";

const url = "https://yhmppriwbkoheyxatvvu.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlobXBwcml3YmtvaGV5eGF0dnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxODUsImV4cCI6MjEwNzAzMDE4NX0.TKHFp-RblH_FMYVHRyF7s0eoO31CT6PZaONeJVZHUgU";
const supabase = createClient(url, key);

async function check() {
  console.log("Checking DB...");
  const [p, prof, needs] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).is("embedding", null),
    supabase.from("profiles").select("id", { count: "exact", head: true }).is("embedding", null),
    supabase.from("project_needs").select("id", { count: "exact", head: true }).is("embedding", null)
  ]);
  
  console.log("Missing projects:", p.count, p.error?.message);
  console.log("Missing profiles:", prof.count, prof.error?.message);
  console.log("Missing needs:", needs.count, needs.error?.message);

  const { data: hasEmbedding } = await supabase.from("projects").select("embedding").not("embedding", "is", null).limit(1);
  if (hasEmbedding && hasEmbedding[0] && hasEmbedding[0].embedding) {
    let parsed;
    try {
      parsed = JSON.parse(hasEmbedding[0].embedding);
      console.log("Project embedding length:", parsed.length);
    } catch (e) {
      if (typeof hasEmbedding[0].embedding === 'string') {
        const cleaned = hasEmbedding[0].embedding.replace('[', '').replace(']', '');
        console.log("Vector string parsed length:", cleaned.split(",").length);
      }
    }
  }

  // test RPC
  const dummyVector = `[${Array(768).fill(0).join(",")}]`;
  const { data: matchData, error: matchErr } = await supabase.rpc("match_projects", {
    query_embedding: dummyVector,
    match_threshold: -1,
    match_count: 5
  });
  console.log("RPC match_projects err:", matchErr?.message);
  console.log("RPC match_projects res length:", matchData?.length);
  
  const { data: profMatchData, error: profMatchErr } = await supabase.rpc("match_profiles", {
    query_embedding: dummyVector,
    match_threshold: -1,
    match_count: 5
  });
  console.log("RPC match_profiles err:", profMatchErr?.message);
  console.log("RPC match_profiles res length:", profMatchData?.length);
}

check().catch(console.error);
