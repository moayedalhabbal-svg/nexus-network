-- Create a generic search function for project needs (open roles)
CREATE OR REPLACE FUNCTION match_project_needs(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  project_id uuid,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pn.id,
    pn.project_id,
    1 - (pn.embedding <=> query_embedding) AS similarity
  FROM project_needs pn
  JOIN projects p ON p.id = pn.project_id
  WHERE 1 - (pn.embedding <=> query_embedding) > match_threshold
    AND p.is_private = false
    AND pn.is_filled = false
  ORDER BY pn.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Secure the function: Prevent overly broad default access and restrict to explicit Supabase roles
REVOKE EXECUTE ON FUNCTION match_project_needs(vector(768), float, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION match_project_needs(vector(768), float, int) TO anon;
GRANT EXECUTE ON FUNCTION match_project_needs(vector(768), float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION match_project_needs(vector(768), float, int) TO service_role;
