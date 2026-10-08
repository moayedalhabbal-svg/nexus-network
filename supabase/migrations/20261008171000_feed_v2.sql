-- FEED 2.0 Schema Migration

-- Add new columns to the posts table for Feed 2.0
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS post_type VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS opportunity_ref UUID REFERENCES opportunities(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS parent_post_id UUID REFERENCES posts(id) ON DELETE SET NULL;

-- Create Post Likes table to track actual likes instead of just a counter
CREATE TABLE IF NOT EXISTS post_likes (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- Create Post Saves table for users saving content
CREATE TABLE IF NOT EXISTS post_saves (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- Enable RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_likes
CREATE POLICY "Anyone can view likes"
ON post_likes FOR SELECT
USING (true);

CREATE POLICY "Users can like posts"
ON post_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON post_likes FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for post_saves
CREATE POLICY "Users can view their own saves"
ON post_saves FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
ON post_saves FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their own saves"
ON post_saves FOR DELETE
USING (auth.uid() = user_id);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- RPC Functions to handle counter increments safely
CREATE OR REPLACE FUNCTION increment_post_likes(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET likes_count = likes_count + 1
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_post_likes(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = p_id;
END;
$$;
