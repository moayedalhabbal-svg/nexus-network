-- Micro-Bounties Migration
-- Adds bounties, applications, and submissions tables

CREATE TABLE IF NOT EXISTS bounties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    skills_required TEXT[] DEFAULT '{}',
    category TEXT,
    expected_deliverables TEXT,
    acceptance_criteria TEXT,
    estimated_effort TEXT,
    deadline TIMESTAMPTZ,
    contributors_needed INTEGER DEFAULT 1,
    reward_type TEXT DEFAULT 'non_cash', -- 'cash' or 'non_cash'
    reward_details TEXT,
    cash_currency TEXT,
    cash_amount_range TEXT,
    cash_is_negotiable BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'draft', -- 'draft', 'open', 'in_progress', 'submitted_for_review', 'revision_requested', 'completed', 'cancelled', 'expired'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bounty_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bounty_id UUID REFERENCES bounties(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'withdrawn'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bounty_id, applicant_id)
);

CREATE TABLE IF NOT EXISTS bounty_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bounty_id UUID REFERENCES bounties(id) ON DELETE CASCADE,
    contributor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    description TEXT,
    urls TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'submitted', -- 'submitted', 'revision_requested', 'accepted'
    owner_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies

ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_submissions ENABLE ROW LEVEL SECURITY;

-- Bounties
CREATE POLICY "Bounties are viewable by everyone" ON bounties FOR SELECT USING (true);
CREATE POLICY "Users can insert bounties for their projects" ON bounties FOR INSERT WITH CHECK (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM project_members WHERE project_id = bounties.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
);
CREATE POLICY "Users can update their bounties" ON bounties FOR UPDATE USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM project_members WHERE project_id = bounties.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
);
CREATE POLICY "Users can delete their bounties" ON bounties FOR DELETE USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM project_members WHERE project_id = bounties.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Applications
CREATE POLICY "Applicants and bounty owners can view applications" ON bounty_applications FOR SELECT USING (
    auth.uid() = applicant_id OR 
    EXISTS (SELECT 1 FROM bounties WHERE id = bounty_applications.bounty_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = bounties.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))))
);
CREATE POLICY "Any authenticated user can apply" ON bounty_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Applicants can update their application or owners can accept/reject" ON bounty_applications FOR UPDATE USING (
    auth.uid() = applicant_id OR 
    EXISTS (SELECT 1 FROM bounties WHERE id = bounty_applications.bounty_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = bounties.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))))
);
CREATE POLICY "Applicants can delete their application" ON bounty_applications FOR DELETE USING (auth.uid() = applicant_id);

-- Submissions
CREATE POLICY "Contributors and bounty owners can view submissions" ON bounty_submissions FOR SELECT USING (
    auth.uid() = contributor_id OR 
    EXISTS (SELECT 1 FROM bounties WHERE id = bounty_submissions.bounty_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = bounties.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))))
);
CREATE POLICY "Accepted contributors can submit" ON bounty_submissions FOR INSERT WITH CHECK (
    auth.uid() = contributor_id AND
    EXISTS (SELECT 1 FROM bounty_applications WHERE bounty_id = bounty_submissions.bounty_id AND applicant_id = auth.uid() AND status = 'accepted')
);
CREATE POLICY "Contributors and owners can update submissions" ON bounty_submissions FOR UPDATE USING (
    auth.uid() = contributor_id OR 
    EXISTS (SELECT 1 FROM bounties WHERE id = bounty_submissions.bounty_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = bounties.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))))
);
