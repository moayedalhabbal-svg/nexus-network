const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yhmppriwbkoheyxatvvu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlobXBwcml3YmtvaGV5eGF0dnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxODUsImV4cCI6MjEwNzAzMDE4NX0.TKHFp-RblH_FMYVHRyF7s0eoO31CT6PZaONeJVZHUgU'
);

async function run() {
  console.log('Querying projects...');
  const { data: projects, error } = await supabase.from('projects').select('*');
  console.log('Projects count:', projects?.length, error);

  console.log('Querying profiles...');
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  console.log('Profiles count:', profiles?.length, pError);
}
run();
