-- Phase 8.14: Product Analytics & Growth Infrastructure

CREATE TABLE IF NOT EXISTS product_analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be null for anonymous tracking or if user is deleted
    event_type VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events should be insert-only from the client/server, and readable only by admins.
ALTER TABLE product_analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own events (or anonymous if we want, but let's restrict to authenticated for now)
CREATE POLICY "Users can insert their own analytics events" 
ON product_analytics_events FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Only admins can read analytics
CREATE POLICY "Only admins can view analytics" 
ON product_analytics_events FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Index for fast analytics queries based on time and event type
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON product_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON product_analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON product_analytics_events(user_id);
