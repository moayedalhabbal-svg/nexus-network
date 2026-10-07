-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- USERS & PROFILES
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  avatar TEXT,
  location TEXT,
  timezone TEXT,
  roles TEXT[] DEFAULT '{}',
  interests JSONB DEFAULT '[]', -- Array of { id, name }
  intents TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'flexible',
  collaboration_preferences TEXT[] DEFAULT '{}',
  preferred_team_size TEXT,
  profile_visibility TEXT DEFAULT 'public',
  search_visibility BOOLEAN DEFAULT true,
  online_status TEXT DEFAULT 'offline',
  completion_percentage INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  endorsements INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false
);

CREATE TABLE user_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  current BOOLEAN DEFAULT false,
  description TEXT
);

CREATE TABLE proof_of_work (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  verified BOOLEAN DEFAULT false
);

-- ==========================================
-- PROJECTS & COLLABORATION
-- ==========================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pitch TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  description TEXT NOT NULL,
  stage TEXT NOT NULL,
  categories TEXT[] DEFAULT '{}',
  technologies TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  remote BOOLEAN DEFAULT true,
  what_exists TEXT,
  what_needed TEXT,
  collaboration_status TEXT DEFAULT 'active',
  funding_status TEXT DEFAULT 'bootstrapped',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  preferred_skills TEXT[] DEFAULT '{}',
  commitment TEXT NOT NULL,
  compensation TEXT NOT NULL,
  collaboration TEXT NOT NULL,
  status TEXT DEFAULT 'open'
);

CREATE TABLE project_team (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT false
);

-- ==========================================
-- APPLICATIONS
-- ==========================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  need_id UUID REFERENCES project_needs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  pitch TEXT NOT NULL,
  match_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- MATCHING ENGINE (Vector Embeddings)
-- ==========================================
CREATE TABLE user_embeddings (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  embedding vector(1536), -- Assuming OpenAI embeddings
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_embeddings (
  id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  embedding vector(1536),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- CONNECTIONS & MESSAGING
-- ==========================================
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  context TEXT NOT NULL,
  intent TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- RLS POLICIES (Row Level Security)
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;

-- Users can read all public users
CREATE POLICY "Public users are viewable by everyone." ON users
  FOR SELECT USING (profile_visibility = 'public');

-- Users can update their own profile
CREATE POLICY "Users can update their own profile." ON users
  FOR UPDATE USING (auth.uid() = id);

-- Projects can be viewed by everyone
CREATE POLICY "Projects are viewable by everyone." ON projects
  FOR SELECT USING (true);

-- Projects can be created by authenticated users
CREATE POLICY "Authenticated users can create projects." ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Projects can be updated by owners
CREATE POLICY "Owners can update their projects." ON projects
  FOR UPDATE USING (auth.uid() = owner_id);
