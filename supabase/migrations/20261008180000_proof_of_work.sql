-- Create Proof of Work table
CREATE TABLE IF NOT EXISTS proof_of_work (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    source VARCHAR(100),
    skills JSONB DEFAULT '[]'::jsonb,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    verification_status VARCHAR(50) DEFAULT 'added_by_you',
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE proof_of_work ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_proof_of_work_user_id ON proof_of_work(user_id);
CREATE INDEX IF NOT EXISTS idx_proof_of_work_project_id ON proof_of_work(project_id);
CREATE INDEX IF NOT EXISTS idx_proof_of_work_type ON proof_of_work(type);

-- RLS Policies

-- Users can read their own proof of work regardless of privacy
CREATE POLICY "Users can read own proof of work"
    ON proof_of_work FOR SELECT
    USING (auth.uid() = user_id);

-- Anyone can read public proof of work
CREATE POLICY "Anyone can read public proof of work"
    ON proof_of_work FOR SELECT
    USING (is_private = false);

-- Users can insert their own proof of work
CREATE POLICY "Users can create own proof of work"
    ON proof_of_work FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own proof of work
CREATE POLICY "Users can update own proof of work"
    ON proof_of_work FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own proof of work
CREATE POLICY "Users can delete own proof of work"
    ON proof_of_work FOR DELETE
    USING (auth.uid() = user_id);
