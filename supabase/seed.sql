-- ==========================================
-- PHASE 8.5 SEED DATA
-- ==========================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Seed Users (auth.users)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000001', '00000000-0000-0000-0000-000000000000', 'elena.vasquez@mit.edu', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Elena Vasquez'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000002', '00000000-0000-0000-0000-000000000000', 'marcus.chen@stanford.edu', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Marcus Chen'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000003', '00000000-0000-0000-0000-000000000000', 'aisha.okafor@imperial.ac.uk', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Aisha Okafor'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000004', '00000000-0000-0000-0000-000000000000', 'kai.nakamura@design.co', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Kai Nakamura'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000005', '00000000-0000-0000-0000-000000000000', 'priya.sharma@iitb.ac.in', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Priya Sharma'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000006', '00000000-0000-0000-0000-000000000000', 'james.kowalski@agritech.io', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'James Kowalski'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000007', '00000000-0000-0000-0000-000000000000', 'sofia.martinez@cleantech.vc', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Sofia Martinez'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000008', '00000000-0000-0000-0000-000000000000', 'omar.hassan@tum.de', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Omar Hassan'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000009', '00000000-0000-0000-0000-000000000000', 'rachel.wright@growth.io', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Rachel Wright'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000010', '00000000-0000-0000-0000-000000000000', 'david.kim@biolab.edu', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'David Kim'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000011', '00000000-0000-0000-0000-000000000000', 'lena.berg@ethz.ch', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Lena Berg'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000012', '00000000-0000-0000-0000-000000000000', 'alex.petrov@startup.io', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Alex Petrov'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000013', '00000000-0000-0000-0000-000000000000', 'nina.williams@fintech.co', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Nina Williams'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000014', '00000000-0000-0000-0000-000000000000', 'yuki.tanaka@robotics.jp', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Yuki Tanaka'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000015', '00000000-0000-0000-0000-000000000000', 'carlos.rivera@sustainable.org', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Carlos Rivera'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000016', '00000000-0000-0000-0000-000000000000', 'sarah.mitchell@cs.princeton.edu', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Sarah Mitchell'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000017', '00000000-0000-0000-0000-000000000000', 'tom.anderson@devops.cloud', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Tom Anderson'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000018', '00000000-0000-0000-0000-000000000000', 'maya.johnson@solar.energy', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Maya Johnson'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000019', '00000000-0000-0000-0000-000000000000', 'ben.goldstein@vc.fund', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Ben Goldstein'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000020', '00000000-0000-0000-0000-000000000000', 'ava.chen@cs.cmu.edu', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Ava Chen'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000021', '00000000-0000-0000-0000-000000000000', 'robert.foster@quantum.tech', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Robert Foster'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000022', '00000000-0000-0000-0000-000000000000', 'isabella.rossi@biomedical.it', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Isabella Rossi'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000023', '00000000-0000-0000-0000-000000000000', 'daniel.park@mobility.kr', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Daniel Park'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000024', '00000000-0000-0000-0000-000000000000', 'emma.taylor@creative.studio', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Emma Taylor'}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES ('11111111-2222-3333-4444-000000000025', '00000000-0000-0000-0000-000000000000', 'prof.chen@berkeley.edu', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": 'Prof. Wei Chen'}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Profiles
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000001', 'elena.vasquez955', 'Elena Vasquez', 'Robotics Engineer & Climate Tech Founder', 'Building autonomous systems for renewable energy infrastructure. Previously at Boston Dynamics. MIT Mechanical Engineering PhD candidate researching AI-driven robotic maintenance for solar farms. Passionate about using robotics to accelerate the energy transition.', '/avatars/elena.jpg', 'Boston, MA', 'EST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000002', 'marcus.chen503', 'Marcus Chen', 'Full-Stack Engineer & AI Startup Builder', 'Shipping products that matter. Stanford CS, previously at Stripe. Building AI tools that help small businesses compete with enterprise. Interested in the intersection of AI, fintech, and accessibility.', '/avatars/marcus.jpg', 'San Francisco, CA', 'PST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000003', 'aisha.okafor143', 'Aisha Okafor', 'Energy Engineer & Battery Research Scientist', 'Dedicated to making clean energy storage affordable and accessible. Currently leading battery degradation research at Imperial College London. Published 8 papers on lithium-ion battery health prediction using machine learning. Looking for collaborators to commercialize our research.', '/avatars/aisha.jpg', 'London, UK', 'GMT', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000004', 'kai.nakamura765', 'Kai Nakamura', 'Product Designer & Design Systems Architect', 'Design is how it works. Previously at Figma and Airbnb. I create design systems and user experiences that scale. Currently exploring how AI can enhance design workflows. Looking for early-stage projects where design is a core differentiator.', '/avatars/kai.jpg', 'Tokyo, Japan', 'JST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000005', 'priya.sharma959', 'Priya Sharma', 'ML Engineer & Healthcare AI Researcher', 'Using AI to make healthcare accessible in underserved communities. IIT Bombay alumna. Currently building diagnostic tools that work offline on low-cost devices. Published in NeurIPS and MICCAI. Seeking collaborators who understand both the technical and social dimensions of healthcare AI.', '/avatars/priya.jpg', 'Mumbai, India', 'IST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000006', 'james.kowalski617', 'James Kowalski', 'Agricultural Engineer & IoT Specialist', 'Third-generation farmer turned engineer. Building the future of precision agriculture with IoT sensors and AI-driven crop management. Currently prototyping autonomous soil monitoring robots. Looking for co-founders and embedded systems engineers.', '/avatars/james.jpg', 'Madison, WI', 'CST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000007', 'sofia.martinez911', 'Sofia Martinez', 'Climate Tech Investor & Former Energy Engineer', 'Partner at CleanTech Ventures. Previously spent 8 years in energy engineering before moving to investing. We back founders working on climate solutions from pre-seed to Series A. Particularly interested in energy storage, carbon capture, and sustainable agriculture.', '/avatars/sofia.jpg', 'New York, NY', 'EST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000008', 'omar.hassan807', 'Omar Hassan', 'Autonomous Systems Researcher & Mobility Innovator', 'PhD researcher at TU Munich working on autonomous vehicle perception. Previously interned at Waymo. Passionate about making self-driving technology safer and more accessible for developing countries. Seeking collaborators in computer vision and sensor fusion.', '/avatars/omar.jpg', 'Munich, Germany', 'CET', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000009', 'rachel.wright968', 'Rachel Wright', 'Growth Marketer & Startup Operator', 'Took two B2B SaaS products from zero to $1M ARR. Expert in content marketing, SEO, and community-led growth. Looking for technical founders who need a growth partner. I turn great products into great businesses.', '/avatars/rachel.jpg', 'Austin, TX', 'CST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000010', 'david.kim737', 'David Kim', 'Biomedical Engineer & Diagnostics Researcher', 'Building point-of-care diagnostic devices that cost under $5 to manufacture. Postdoc at Johns Hopkins. My lab develops paper-based biosensors for infectious disease detection in low-resource settings. Interested in partnerships with ML engineers to digitize test results.', '/avatars/david.jpg', 'Baltimore, MD', 'EST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000011', 'lena.berg198', 'Lena Berg', 'Carbon Capture Researcher & Chemical Engineer', 'Developing next-generation direct air capture systems at ETH Zurich. Passionate about making carbon removal economically viable.', '/avatars/lena.jpg', 'Zurich, Switzerland', 'CET', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000012', 'alex.petrov14', 'Alex Petrov', 'Serial Entrepreneur & EdTech Builder', 'Founded two education companies. Currently building an AI-powered personalized learning platform. Looking for engineers and learning scientists.', '/avatars/alex.jpg', 'Berlin, Germany', 'CET', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000013', 'nina.williams976', 'Nina Williams', 'Backend Engineer & FinTech Specialist', 'Building scalable financial systems. Previously at Plaid and Square. Expert in distributed systems, payment processing, and regulatory compliance.', '/avatars/nina.jpg', 'Chicago, IL', 'CST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000014', 'yuki.tanaka489', 'Yuki Tanaka', 'Mechatronics Engineer & Hardware Builder', 'Building robots that work alongside humans. Experience with industrial robots at Fanuc and consumer robotics at Sony. Seeking climate-focused hardware projects.', '/avatars/yuki.jpg', 'Osaka, Japan', 'JST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000015', 'carlos.rivera685', 'Carlos Rivera', 'Sustainability Consultant & Clean Energy Advocate', 'Helping businesses and cities transition to clean energy. 10 years in energy consulting. Mentoring first-time climate founders.', '/avatars/carlos.jpg', 'Mexico City, Mexico', 'CST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000016', 'sarah.mitchell459', 'Sarah Mitchell', 'NLP Researcher & AI Ethics Advocate', 'Working on bias detection and fairness in language models. Princeton NLP group. Published at ACL, EMNLP. Looking for collaborative research opportunities.', '/avatars/sarah.jpg', 'Princeton, NJ', 'EST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000017', 'tom.anderson544', 'Tom Anderson', 'DevOps Engineer & Cloud Architect', 'Scaling startups to millions of users. AWS certified. Expert in Kubernetes, Terraform, and CI/CD. Looking for early-stage startups that need infrastructure done right from day one.', '/avatars/tom.jpg', 'Seattle, WA', 'PST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000018', 'maya.johnson577', 'Maya Johnson', 'Solar Energy Engineer & Community Organizer', 'Making solar accessible to underserved communities. Civil engineer turned clean energy advocate. Running community solar projects across the American South.', '/avatars/maya.jpg', 'Atlanta, GA', 'EST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000019', 'ben.goldstein919', 'Ben Goldstein', 'Deep Tech Investor & Former CTO', 'Partner at Horizon Ventures. Former CTO of a Series C AI company. Investing in AI, robotics, and computational biology. $50M AUM.', '/avatars/ben.jpg', 'Palo Alto, CA', 'PST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000020', 'ava.chen752', 'Ava Chen', 'CS Student & Open Source Contributor', 'Junior at CMU studying CS. Active open source contributor. Building a portfolio of side projects in web development and ML. Looking for my first startup experience.', '/avatars/ava.jpg', 'Pittsburgh, PA', 'EST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000021', 'robert.foster629', 'Robert Foster', 'Quantum Computing Researcher & Physicist', 'Exploring quantum advantage for optimization problems. Published 15 papers. Ex-IBM Quantum. Seeking industry collaborations.', '/avatars/robert.jpg', 'Cambridge, UK', 'GMT', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000022', 'isabella.rossi613', 'Isabella Rossi', 'Biomedical Researcher & Wearable Tech Developer', 'Building wearable health monitoring devices. Politecnico di Milano. Expertise in biosensors and signal processing.', '/avatars/isabella.jpg', 'Milan, Italy', 'CET', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000023', 'daniel.park243', 'Daniel Park', 'Smart Mobility Engineer & Urban Planner', 'Creating smarter cities through connected transportation. KAIST graduate. Working on vehicle-to-infrastructure communication for Seoul Metropolitan Government.', '/avatars/daniel.jpg', 'Seoul, South Korea', 'KST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000024', 'emma.taylor71', 'Emma Taylor', 'Creative Technologist & XR Designer', 'Bridging art and technology. Creating immersive experiences using AR/VR. Previously at Magic Leap. Looking for projects at the intersection of creativity and impact.', '/avatars/emma.jpg', 'Los Angeles, CA', 'PST', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, username, full_name, headline, bio, avatar_url, location, timezone, search_visibility)
VALUES ('11111111-2222-3333-4444-000000000025', 'prof.chen48', 'Prof. Wei Chen', 'Professor of Computer Science & AI Lab Director', 'UC Berkeley CS faculty. Directing the Berkeley AI for Impact Lab. Looking for motivated graduate researchers. 100+ publications in top-tier venues.', '/avatars/prof_chen.jpg', 'Berkeley, CA', 'PST', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Projects
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000026', '11111111-2222-3333-4444-000000000001', 'SolarBot — Autonomous Solar Farm Maintenance', 'Robots that keep solar farms at peak efficiency, autonomously.', 'SolarBot combines robotics, computer vision, and energy engineering to create autonomous maintenance robots for solar farms. Our system can inspect thousands of panels per day, detect micro-cracks and hotspots, and perform automated cleaning. Currently building our second prototype.', 'prototype', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000026', '11111111-2222-3333-4444-000000000001', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000026', 'ML Engineer', '', '10hrs_week', 'No');
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000026', 'Embedded Systems Engineer', '', '10hrs_week', 'No');
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000026', 'Frontend Developer', '', '5hrs_week', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000027', '11111111-2222-3333-4444-000000000010', 'MedScan — Affordable AI Diagnostics for Everyone', 'Medical diagnostics that cost under $5 and work offline on any smartphone.', 'MedScan creates a platform combining ultra-low-cost paper-based diagnostic tests with smartphone-based AI analysis. Users place a test strip on a phone camera, and our ML model provides diagnostic results in 60 seconds. Currently detecting malaria, TB markers, and basic blood chemistry.', 'mvp', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000027', '11111111-2222-3333-4444-000000000010', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000027', 'Mobile Developer', '', '10hrs_week', 'No');
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000027', 'ML Engineer', '', '5hrs_week', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000028', '11111111-2222-3333-4444-000000000006', 'CropSense — AI-Powered Precision Agriculture', 'IoT sensors and AI that help farmers grow more food with less water.', 'CropSense is building an end-to-end precision agriculture system for smallholder farmers. Our solar-powered soil sensors cost $15 to manufacture and last 3+ seasons. AI analyzes soil data, weather patterns, and crop models to send actionable recommendations via SMS.', 'validation', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000028', '11111111-2222-3333-4444-000000000006', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000028', 'AI/ML Engineer', '', '10hrs_week', 'No');
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000028', 'Hardware Engineer', '', '10hrs_week', 'No');
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000028', 'Growth Lead', '', 'full_time', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000029', '11111111-2222-3333-4444-000000000012', 'LearnLoop — AI Adaptive Learning Platform', 'Personalized education powered by AI that adapts to how each student actually learns.', 'LearnLoop uses large language models and learning science to create truly personalized education. Our AI understands where each student struggles and generates targeted explanations, practice problems, and review schedules. Currently focused on STEM subjects for university students.', 'mvp', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000029', '11111111-2222-3333-4444-000000000012', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000029', 'Full-Stack Developer', '', '20hrs_week', 'No');
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000029', 'Learning Scientist', '', '10hrs_week', 'No');
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000029', 'Product Designer', '', '10hrs_week', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000030', '11111111-2222-3333-4444-000000000003', 'BatteryLens — Predictive Battery Health Intelligence', 'AI that predicts exactly when batteries will fail, before they do.', 'BatteryLens turns battery usage data into actionable health predictions. Our models understand degradation mechanisms at a chemical level and can forecast capacity fade, internal resistance growth, and remaining cycles with high precision.', 'research_concept', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000030', '11111111-2222-3333-4444-000000000003', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000030', 'Software Engineer', '', '10hrs_week', 'No');
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000030', 'Data Scientist', '', '10hrs_week', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000031', '11111111-2222-3333-4444-000000000008', 'SafeDrive — Autonomous Vehicle Safety in Adverse Weather', 'Making self-driving cars work when the weather doesn''t cooperate.', 'SafeDrive develops perception algorithms specifically designed for challenging weather conditions. Our approach combines lidar, radar, and camera data with weather-adaptive neural networks.', 'active_research', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000031', '11111111-2222-3333-4444-000000000008', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000031', 'Research Engineer', '', '10hrs_week', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000032', '11111111-2222-3333-4444-000000000018', 'CarbonTrack — Enterprise Carbon Accounting Platform', 'The operating system for corporate carbon management.', 'CarbonTrack helps enterprises measure, track, and reduce their carbon footprint. Our platform automatically ingests data from procurement systems, travel platforms, and logistics providers to calculate emissions across all scopes.', 'early_traction', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000032', '11111111-2222-3333-4444-000000000018', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000032', 'Senior Frontend Engineer', '', 'full_time', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000033', '11111111-2222-3333-4444-000000000005', 'NeuralAccess — Computer Vision for Accessibility', 'AI eyes for the visually impaired, running on any smartphone.', 'NeuralAccess transforms any smartphone into a powerful visual assistant. Users point their camera, and AI describes what it sees in real-time — reading signs, identifying products, recognizing faces (with consent), and providing spatial awareness.', 'prototype', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000033', '11111111-2222-3333-4444-000000000005', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000033', 'iOS Developer', '', '10hrs_week', 'No');
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000033', 'UX Researcher', '', '5hrs_week', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000034', '11111111-2222-3333-4444-000000000021', 'QuantumOpt — Quantum-Enhanced Supply Chain Optimization', 'Using quantum computing to solve logistics problems classical computers can''t.', 'QuantumOpt develops quantum algorithms for real-world supply chain optimization. We target problems where even the best classical solvers leave significant value on the table.', 'research_concept', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000034', '11111111-2222-3333-4444-000000000021', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000034', 'Quantum Algorithm Researcher', '', '5hrs_week', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000035', '11111111-2222-3333-4444-000000000022', 'VitalSign — Continuous Wearable Health Monitor', 'Hospital-grade health monitoring in a wristband.', 'VitalSign develops next-generation wearable biosensors that bridge consumer wearables and clinical monitoring devices.', 'prototype', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000035', '11111111-2222-3333-4444-000000000022', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000035', 'Signal Processing Engineer', '', '10hrs_week', 'No');
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000035', 'Mobile Developer', '', '10hrs_week', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000036', '11111111-2222-3333-4444-000000000025', 'EduBridge — University Research Collaboration Network', 'Connecting researchers across institutions to accelerate science.', 'EduBridge makes it easy for researchers to discover potential collaborators based on research interests, methodologies, and complementary expertise.', 'idea', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000036', '11111111-2222-3333-4444-000000000025', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000036', 'Full-Stack Developer', '', '10hrs_week', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000037', '11111111-2222-3333-4444-000000000011', 'SmartGrid AI — Renewable Energy Grid Optimization', 'AI that balances renewable energy supply and demand in real-time.', 'SmartGrid AI creates neural forecasting models for solar and wind generation combined with battery storage optimization algorithms.', 'validation', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000037', '11111111-2222-3333-4444-000000000011', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000037', 'Energy Systems Engineer', '', '10hrs_week', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000038', '11111111-2222-3333-4444-000000000013', 'FinBridge — Financial Inclusion API', 'Banking infrastructure for the next billion users.', 'FinBridge provides a unified API for payments, savings, lending, and identity verification specifically designed for emerging market fintechs.', 'mvp', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000038', '11111111-2222-3333-4444-000000000013', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000038', 'Backend Engineer', '', '20hrs_week', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000039', '11111111-2222-3333-4444-000000000023', 'SmartCity Seoul — V2I Communication Platform', 'Connecting vehicles to city infrastructure for safer, smarter transportation.', 'Building the communication backbone for smart cities, starting with Seoul''s 100+ connected intersections.', 'prototype', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000039', '11111111-2222-3333-4444-000000000023', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000039', 'IoT Platform Engineer', '', '20hrs_week', 'No');
INSERT INTO projects (id, owner_id, title, pitch, description, stage, category, is_private)
VALUES ('11111111-2222-3333-4444-000000000040', '11111111-2222-3333-4444-000000000016', 'FairLM — Bias Detection & Mitigation for LLMs', 'Making AI language models fair and accountable.', 'FairLM provides the tools needed to measure, understand, and reduce bias in language models. Open-source and research-driven.', 'active_research', 'technology', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO project_members (project_id, user_id, role) VALUES ('11111111-2222-3333-4444-000000000040', '11111111-2222-3333-4444-000000000016', 'Founder') ON CONFLICT DO NOTHING;
INSERT INTO project_needs (project_id, role_title, description, commitment_level, equity_range)
VALUES ('11111111-2222-3333-4444-000000000040', 'NLP Researcher', '', '10hrs_week', 'No');