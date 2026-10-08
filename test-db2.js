const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yhmppriwbkoheyxatvvu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlobXBwcml3YmtvaGV5eGF0dnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxODUsImV4cCI6MjEwNzAzMDE4NX0.TKHFp-RblH_FMYVHRyF7s0eoO31CT6PZaONeJVZHUgU'
);

async function run() {
  const { data } = await supabase.from('project_needs').select('*').limit(1);
  console.log(data);
}
run();
