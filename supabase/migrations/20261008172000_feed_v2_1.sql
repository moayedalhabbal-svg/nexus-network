-- FEED 2.1 Schema Migration

-- Add new columns to the comments table for threaded replies and likes
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Create Comment Likes table
CREATE TABLE IF NOT EXISTS comment_likes (
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (comment_id, user_id)
);

-- Enable RLS for Comments and Comment Likes
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments"
ON comments FOR SELECT
USING (true);

CREATE POLICY "Users can create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments"
ON comments FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
USING (auth.uid() = author_id);

-- RLS Policies for comment_likes
CREATE POLICY "Anyone can view comment likes"
ON comment_likes FOR SELECT
USING (true);

CREATE POLICY "Users can like comments"
ON comment_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON comment_likes FOR DELETE
USING (auth.uid() = user_id);

-- RPC Functions to handle comment likes counter
CREATE OR REPLACE FUNCTION increment_comment_likes(c_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE comments
  SET likes_count = likes_count + 1
  WHERE id = c_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_comment_likes(c_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE comments
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = c_id;
END;
$$;

-- Create storage bucket for post media if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post_media', 'post_media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for post_media
CREATE POLICY "Anyone can view post media"
ON storage.objects FOR SELECT
USING (bucket_id = 'post_media');

CREATE POLICY "Authenticated users can upload post media"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'post_media' AND 
    auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own post media"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'post_media' AND 
    auth.uid() = owner
);

CREATE POLICY "Users can delete their own post media"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'post_media' AND 
    auth.uid() = owner
);

-- Notifications Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'reply', 'repost', 'follow', 'connection'
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true); -- simplified for now, usually restricted to triggers or service role

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
