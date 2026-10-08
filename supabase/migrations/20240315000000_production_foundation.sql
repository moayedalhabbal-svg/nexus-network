-- NEXUS Production Database Foundation
-- Full Schema with RLS, Indexes, Constraints, and Triggers

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ==========================================
-- 1. ENUMS
-- ==========================================
CREATE TYPE project_stage AS ENUM ('idea', 'validation', 'prototype', 'mvp', 'early_traction', 'growth');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');
CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');

-- ==========================================
-- 2. CORE USERS & PROFILES
-- ==========================================
-- Users table extends auth.users natively in Supabase via triggers, but we'll use a public.profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    headline TEXT,
    bio TEXT,
    avatar_url TEXT,
    location TEXT,
    timezone TEXT,
    is_admin BOOLEAN DEFAULT false,
    search_visibility BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    proficiency_level TEXT,
    verified BOOLEAN DEFAULT false,
    UNIQUE(user_id, skill_name)
);

CREATE TABLE user_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    interest_name TEXT NOT NULL,
    UNIQUE(user_id, interest_name)
);

CREATE TABLE experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT
);

CREATE TABLE education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT,
    start_date DATE,
    end_date DATE
);

-- ==========================================
-- 3. PROJECTS & COLLABORATION
-- ==========================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    pitch TEXT NOT NULL,
    description TEXT,
    stage project_stage DEFAULT 'idea',
    category TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

CREATE TABLE project_needs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    role_title TEXT NOT NULL,
    commitment TEXT NOT NULL,
    is_filled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    need_id UUID REFERENCES project_needs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status application_status DEFAULT 'pending',
    ai_match_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. SOCIAL & FEED
-- ==========================================
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status connection_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, recipient_id)
);

CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    project_ref UUID REFERENCES projects(id) ON DELETE SET NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. MESSAGING
-- ==========================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_group BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_members (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. SPECIALIZED NETWORKS
-- ==========================================
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'research', 'mentor', 'funding'
    title TEXT NOT NULL,
    institution TEXT,
    description TEXT NOT NULL,
    stipend TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. ADMIN, MODERATION & EMBEDDINGS
-- ==========================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL, -- 'user', 'project', 'post'
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status report_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profile_embeddings (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    embedding vector(1536),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_embeddings (
    id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    embedding vector(1536),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_stage ON projects(stage);
CREATE INDEX idx_applications_project_id ON applications(project_id);
CREATE INDEX idx_connections_users ON connections(requester_id, recipient_id);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_opportunities_type ON opportunities(type);

-- Vector indexes for fast semantic search (using HNSW)
CREATE INDEX idx_profile_embeddings ON profile_embeddings USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_project_embeddings ON project_embeddings USING hnsw (embedding vector_cosine_ops);

-- ==========================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read public profiles. Users can update their own.
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (search_visibility = true);
CREATE POLICY "Users can edit their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: Anyone can read public projects. Owners can edit.
CREATE POLICY "Public projects are viewable by everyone" ON projects FOR SELECT USING (is_private = false);
CREATE POLICY "Owners can manage projects" ON projects FOR ALL USING (auth.uid() = owner_id);

-- Applications: Project owners can see applications to their projects. Applicants can see their own.
CREATE POLICY "Users can view their own applications" ON applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Project owners can view applications" ON applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = applications.project_id AND projects.owner_id = auth.uid())
);
CREATE POLICY "Users can create applications" ON applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- Messages: Only members of a conversation can read/write messages
CREATE POLICY "Users can read conversation messages" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_members WHERE conversation_members.conversation_id = messages.conversation_id AND conversation_members.user_id = auth.uid())
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND 
    EXISTS (SELECT 1 FROM conversation_members WHERE conversation_members.conversation_id = messages.conversation_id AND conversation_members.user_id = auth.uid())
);

-- Admin Fallback: Admins can do anything
CREATE POLICY "Admins can do everything" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ==========================================
-- 10. TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
