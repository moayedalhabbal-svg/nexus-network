import * as fs from 'fs';
import { SEED_USERS, SEED_PROJECTS } from '../src/lib/seed-data';

// Basic UUID generator deterministic for given IDs
const uuidMap = new Map<string, string>();
let uuidCounter = 1;
function getUuid(id: string) {
  if (!uuidMap.has(id)) {
    const padded = String(uuidCounter++).padStart(12, '0');
    uuidMap.set(id, `11111111-2222-3333-4444-${padded}`);
  }
  return uuidMap.get(id)!;
}

function escapeSql(str: string) {
  if (!str) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

const sqlLines: string[] = [];
sqlLines.push('-- ==========================================');
sqlLines.push('-- PHASE 8.5 SEED DATA');
sqlLines.push('-- ==========================================');
sqlLines.push('');
sqlLines.push('-- Enable pgcrypto for password hashing');
sqlLines.push('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
sqlLines.push('');

sqlLines.push('-- 1. Seed Users (auth.users)');
for (const user of SEED_USERS) {
  const uid = getUuid(user.id);
  sqlLines.push(`INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)`);
  sqlLines.push(`VALUES ('${uid}', '00000000-0000-0000-0000-000000000000', '${user.email}', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": ${escapeSql(user.name)}}'::jsonb)`);
  sqlLines.push(`ON CONFLICT (id) DO NOTHING;`);
}
sqlLines.push('');

sqlLines.push('-- 2. Seed Profiles');
for (const user of SEED_USERS) {
  const uid = getUuid(user.id);
  const username = user.email.split('@')[0] + Math.floor(Math.random() * 1000);
  sqlLines.push(`INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)`);
  sqlLines.push(`VALUES ('${uid}', '${username}', ${escapeSql(user.name)}, ${escapeSql(user.headline || '')}, ${escapeSql(user.bio || '')}, '${user.avatar}', ${escapeSql(user.location || '')}, ${escapeSql(user.timezone || '')}, true)`);
  sqlLines.push(`ON CONFLICT (id) DO NOTHING;`);
}
sqlLines.push('');

sqlLines.push('-- 3. Seed Projects');
for (const project of SEED_PROJECTS) {
  const pid = getUuid(project.id);
  const ownerId = getUuid(project.ownerId);
  let stage = project.stage.toLowerCase().replace(' ', '_');
  const validStages = ['idea', 'validation', 'prototype', 'mvp', 'early_traction', 'growth'];
  if (!validStages.includes(stage)) {
    stage = 'idea';
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const category = (project as any).tags?.[0] || 'technology';
  sqlLines.push(`INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)`);
  sqlLines.push(`VALUES ('${pid}', '${ownerId}', ${escapeSql(project.title)}, ${escapeSql(project.pitch || project.description.substring(0, 100))}, ${escapeSql(project.description)}, '${stage}', '${category}', false)`);
  sqlLines.push(`ON CONFLICT (id) DO NOTHING;`);
  
  // Add owner as member
  sqlLines.push(`INSERT INTO project_members (project_id, user_id, role) VALUES ('${pid}', '${ownerId}', 'Founder') ON CONFLICT DO NOTHING;`);
  
  // Add needs
  for (const need of (project.needs || [])) {
    sqlLines.push(`INSERT INTO project_needs (project_id, role_title, commitment)`);
    sqlLines.push(`VALUES ('${pid}', ${escapeSql(need.role)}, ${escapeSql(need.commitment || 'flexible')});`);
  }
}

fs.writeFileSync('supabase/seed.sql', sqlLines.join('\n'));
console.log('Generated supabase/seed.sql');
