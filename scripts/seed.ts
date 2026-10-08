import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { SEED_USERS, SEED_PROJECTS, SEED_POSTS, SKILLS_DATABASE, INTERESTS_DATABASE } from '../src/lib/seed-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Helper to generate deterministic UUIDs or map them
const idMap = new Map<string, string>();

async function seed() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Create Auth Users and Profiles
  console.log('👤 Seeding Users...');
  for (const user of SEED_USERS) {
    // Check if user already exists
    let userId;
    
    // Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: {
        full_name: user.name,
      }
    });

    if (authErr) {
      if (authErr.message.includes('already exists')) {
        // Find the user to get ID
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const existing = usersData.users.find(u => u.email === user.email);
        if (existing) {
          userId = existing.id;
        } else {
          console.error(`Failed to find existing user ${user.email}`);
          continue;
        }
      } else {
        console.error(`Error creating auth user ${user.email}:`, authErr);
        continue;
      }
    } else {
      userId = authData.user.id;
    }
    
    idMap.set(user.id, userId);

    // Upsert Profile
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: userId,
      username: user.email.split('@')[0] + Math.floor(Math.random() * 1000),
      full_name: user.name,
      headline: user.headline,
      bio: user.bio,
      avatar_url: user.avatar,
      location: user.location,
      timezone: user.timezone,
      search_visibility: true
    });

    if (profileErr) console.error(`Error upserting profile for ${user.email}:`, profileErr);

    // Seed Skills
    for (const skill of user.skills) {
      await supabase.from('user_skills').upsert({
        user_id: userId,
        skill_name: skill.name,
        proficiency_level: 'expert',
        verified: true
      }, { onConflict: 'user_id, skill_name' });
    }

    // Seed Interests
    for (const interest of (user.interests || [])) {
      await supabase.from('user_interests').upsert({
        user_id: userId,
        interest_name: interest.name,
      }, { onConflict: 'user_id, interest_name' });
    }
    
    // Seed Experience
    for (const exp of (user.experience || [])) {
      await supabase.from('experience').insert({
        user_id: userId,
        title: exp.title || exp.role,
        company: exp.company,
        start_date: new Date().toISOString(), // Simplified for seeding
        is_current: true,
        description: exp.description
      });
    }
  }

  // 2. Seed Projects
  console.log('🚀 Seeding Projects...');
  for (const project of SEED_PROJECTS) {
    const ownerId = idMap.get(project.ownerId);
    if (!ownerId) {
      console.log(`Skipping project ${project.title}, owner not mapped.`);
      continue;
    }

    const { data: projectData, error: projErr } = await supabase.from('projects').insert({
      owner_id: ownerId,
      title: project.title,
      pitch: project.pitch || project.description.substring(0, 100),
      description: project.description,
      stage: project.stage.toLowerCase().replace(' ', '_'),
      category: project.tags?.[0] || 'technology',
      is_private: false
    }).select().single();

    if (projErr) {
      console.error(`Error creating project ${project.title}:`, projErr);
      continue;
    }

    const projectId = projectData.id;
    idMap.set(project.id, projectId);

    // Add owner as member
    await supabase.from('project_members').insert({
      project_id: projectId,
      user_id: ownerId,
      role: 'Founder'
    });

    // Add needs
    for (const need of (project.needs || [])) {
      await supabase.from('project_needs').insert({
        project_id: projectId,
        role_title: need.role,
        description: need.description || '',
        commitment_level: need.commitment || 'flexible',
        equity_range: 'equity' in need ? 'Yes' : 'No'
      });
    }
  }

  console.log('✅ Seeding Complete!');
}

seed().catch(console.error);
