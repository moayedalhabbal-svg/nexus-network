const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yhmppriwbkoheyxatvvu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlobXBwcml3YmtvaGV5eGF0dnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxODUsImV4cCI6MjEwNzAzMDE4NX0.TKHFp-RblH_FMYVHRyF7s0eoO31CT6PZaONeJVZHUgU'
);

async function run() {
  const email = 'test.owner@nexus.app';
  const password = 'Password123!';
  
  console.log("Signing up...");
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authErr) {
    console.error("Auth Error:", authErr.message);
    return;
  }
  
  console.log("Success! User ID:", authData.user.id);
  console.log("Email:", email);
  console.log("Password:", password);
  
  // Create profile
  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: authData.user.id,
    full_name: 'Test Owner',
    email: email,
    role: 'founder',
    headline: 'Testing the Project Workspace',
    bio: 'I am a test account.',
    location: 'San Francisco, CA',
    onboarding_completed: true
  });
  
  if (profileErr) console.error("Profile Error:", profileErr);
  
  // Create a project so they have a workspace
  const { data: project, error: projErr } = await supabase.from('projects').insert({
    owner_id: authData.user.id,
    title: 'Test Collaboration Project',
    pitch: 'Testing the Workspace & Messages',
    description: 'This is a test project to see how the team and tasks work.',
    stage: 'prototype',
    category: 'SaaS'
  }).select().single();
  
  if (projErr) console.error("Project Error:", projErr);
  else console.log("Created test project!");
}

run();
