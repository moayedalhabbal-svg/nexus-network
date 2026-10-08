-- ==========================================
-- PHASE 8.3 SECURITY HARDENING
-- Enable Row Level Security on all tables
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create basic safe policies (Read all, write only your own)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public skills are viewable by everyone" ON user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage their own skills" ON user_skills FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public interests are viewable by everyone" ON user_interests FOR SELECT USING (true);
CREATE POLICY "Users can manage their own interests" ON user_interests FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public experience is viewable by everyone" ON experience FOR SELECT USING (true);
CREATE POLICY "Users can manage their own experience" ON experience FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public education is viewable by everyone" ON education FOR SELECT USING (true);
CREATE POLICY "Users can manage their own education" ON education FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Project owners can manage projects" ON projects FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Project members can view members" ON project_members FOR SELECT USING (true);
CREATE POLICY "Users can manage their own membership" ON project_members FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Project needs are public" ON project_needs FOR SELECT USING (true);
CREATE POLICY "Project owners can manage needs" ON project_needs FOR ALL USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_needs.project_id AND projects.owner_id = auth.uid()));
