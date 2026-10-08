const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yhmppriwbkoheyxatvvu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlobXBwcml3YmtvaGV5eGF0dnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxODUsImV4cCI6MjEwNzAzMDE4NX0.TKHFp-RblH_FMYVHRyF7s0eoO31CT6PZaONeJVZHUgU'
);

async function run() {
  const projectId = '11111111-2222-3333-4444-000000000032';
  const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_owner_id_fkey(full_name, avatar_url, location),
          project_needs(*),
          project_members(*, profiles(full_name, avatar_url))
        `)
        .eq('id', projectId)
        .single();
  console.log("Error:", error);
  console.log("Data:", !!data);
}
run();
