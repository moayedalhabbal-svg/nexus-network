-- NEXUS Phase 8.12 GitHub Integration

-- 1. Create user_providers to securely link identities
CREATE TABLE IF NOT EXISTS public.user_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- e.g., 'github'
    provider_user_id TEXT NOT NULL,
    provider_username TEXT NOT NULL,
    access_token TEXT, -- Only stored securely if OAuth is configured
    refresh_token TEXT,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- 2. Extend proof_of_work for Provider metadata
ALTER TABLE public.proof_of_work 
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS provider_id TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS user_providers_user_idx ON public.user_providers(user_id);
CREATE INDEX IF NOT EXISTS proof_of_work_provider_idx ON public.proof_of_work(provider);

-- 4. RLS for user_providers
ALTER TABLE public.user_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own providers"
    ON public.user_providers FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
