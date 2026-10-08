-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS embedding vector(1536),
ADD COLUMN IF NOT EXISTS embedding_version VARCHAR(50) DEFAULT 'v1',
ADD COLUMN IF NOT EXISTS embedding_generated_at TIMESTAMPTZ;

-- Add embedding columns to projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS embedding vector(1536),
ADD COLUMN IF NOT EXISTS embedding_version VARCHAR(50) DEFAULT 'v1',
ADD COLUMN IF NOT EXISTS embedding_generated_at TIMESTAMPTZ;

-- Add embedding columns to project needs
ALTER TABLE project_needs
ADD COLUMN IF NOT EXISTS embedding vector(1536),
ADD COLUMN IF NOT EXISTS embedding_version VARCHAR(50) DEFAULT 'v1',
ADD COLUMN IF NOT EXISTS embedding_generated_at TIMESTAMPTZ;

-- Create indexes for vector similarity search
-- We use hnsw (Hierarchical Navigable Small World) for fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_profiles_embedding ON profiles USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_projects_embedding ON projects USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_project_needs_embedding ON project_needs USING hnsw (embedding vector_cosine_ops);

-- Create a generic search function for profiles
CREATE OR REPLACE FUNCTION match_profiles(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    profiles.id,
    1 - (profiles.embedding <=> query_embedding) AS similarity
  FROM profiles
  WHERE 1 - (profiles.embedding <=> query_embedding) > match_threshold
    AND profiles.search_visibility = true
  ORDER BY profiles.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create a generic search function for projects
CREATE OR REPLACE FUNCTION match_projects(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    projects.id,
    1 - (projects.embedding <=> query_embedding) AS similarity
  FROM projects
  WHERE 1 - (projects.embedding <=> query_embedding) > match_threshold
    AND projects.is_private = false
  ORDER BY projects.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
