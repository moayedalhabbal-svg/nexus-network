-- =============================================================================
-- NEXUS Migration: Align vector dimensions to 768 (gemini-embedding-2)
-- Prepared: 2026-10-15
-- Status: VERIFY BEFORE APPLYING
--
-- BACKGROUND: The application generates 768-dimensional embeddings using
-- gemini-embedding-2. The initial migration files (intelligence_v3.sql) set
-- columns and RPC functions to vector(1536) (legacy OpenAI dimensions).
--
-- The match_project_needs RPC (added later) already uses vector(768), consistent
-- with the application code.
--
-- HOW TO VERIFY CURRENT PRODUCTION STATE before applying:
--   SELECT column_name, data_type, udt_name
--   FROM information_schema.columns
--   WHERE table_name = 'profiles' AND column_name = 'embedding';
--
-- And for the RPC functions:
--   SELECT proname, pg_get_function_arguments(oid)
--   FROM pg_proc WHERE proname IN ('match_profiles', 'match_projects')
--   AND pronamespace = 'public'::regnamespace;
--
-- IF production already shows vector(768): DO NOT apply this migration.
-- IF production shows vector(1536): Apply this migration, then run the
--   embedding backfill via the admin panel to regenerate all embeddings.
--
-- WARNING: Changing vector column dimensions requires dropping all existing
-- embedding data. Ensure the backfill is run immediately after.
-- =============================================================================

-- Step 1: Drop vector indexes (required before column type change)
DROP INDEX IF EXISTS public.idx_profiles_embedding;
DROP INDEX IF EXISTS public.idx_projects_embedding;
DROP INDEX IF EXISTS public.idx_project_needs_embedding;

-- Step 2: Alter columns from vector(1536) to vector(768)
-- Using ALTER COLUMN ... TYPE requires a USING clause to cast the data
-- (existing 1536-dim vectors will be cast to NULL since dimensions differ)
ALTER TABLE public.profiles
  ALTER COLUMN embedding TYPE vector(768) USING NULL;

ALTER TABLE public.projects
  ALTER COLUMN embedding TYPE vector(768) USING NULL;

ALTER TABLE public.project_needs
  ALTER COLUMN embedding TYPE vector(768) USING NULL;

-- Step 3: Recreate HNSW indexes for vector(768)
CREATE INDEX idx_profiles_embedding ON public.profiles
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_projects_embedding ON public.projects
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_project_needs_embedding ON public.project_needs
  USING hnsw (embedding vector_cosine_ops);

-- Step 4: Recreate match_profiles to accept vector(768)
DROP FUNCTION IF EXISTS public.match_profiles(vector(1536), float, int);

CREATE OR REPLACE FUNCTION public.match_profiles(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  similarity float
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    profiles.id,
    1 - (profiles.embedding <=> query_embedding) AS similarity
  FROM public.profiles
  WHERE profiles.embedding IS NOT NULL
    AND 1 - (profiles.embedding <=> query_embedding) > match_threshold
    AND profiles.search_visibility = true
  ORDER BY profiles.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Step 5: Recreate match_projects to accept vector(768)
DROP FUNCTION IF EXISTS public.match_projects(vector(1536), float, int);

CREATE OR REPLACE FUNCTION public.match_projects(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  similarity float
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    projects.id,
    1 - (projects.embedding <=> query_embedding) AS similarity
  FROM public.projects
  WHERE projects.embedding IS NOT NULL
    AND 1 - (projects.embedding <=> query_embedding) > match_threshold
    AND projects.is_private = false
  ORDER BY projects.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permissions (match same pattern as match_project_needs)
REVOKE EXECUTE ON FUNCTION public.match_profiles(vector(768), float, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_profiles(vector(768), float, int) TO anon;
GRANT EXECUTE ON FUNCTION public.match_profiles(vector(768), float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_profiles(vector(768), float, int) TO service_role;

REVOKE EXECUTE ON FUNCTION public.match_projects(vector(768), float, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_projects(vector(768), float, int) TO anon;
GRANT EXECUTE ON FUNCTION public.match_projects(vector(768), float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_projects(vector(768), float, int) TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- AFTER APPLYING: Run the embedding backfill via the Admin panel
-- (Admin → Backfill Embeddings) to regenerate all 768-dim embeddings.
-- Until the backfill completes, vector search will return no results (empty
-- embeddings don't match). The application falls back to seed data gracefully.
-- ─────────────────────────────────────────────────────────────────────────────
