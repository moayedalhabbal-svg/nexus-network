-- NEXUS - Phase 8.10: Anti-Ghosting & Collaboration Reliability

-- Update collaboration_records to support withdrawn and cancelled statuses
ALTER TABLE "public"."collaboration_records" DROP CONSTRAINT IF EXISTS "collaboration_records_contribution_status_check";
ALTER TABLE "public"."collaboration_records" ADD CONSTRAINT "collaboration_records_contribution_status_check" 
    CHECK ("contribution_status" IN ('active', 'completed', 'abandoned', 'withdrawn', 'cancelled'));

-- Create response_metrics table to track communication responsiveness
CREATE TABLE IF NOT EXISTS "public"."response_metrics" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "request_type" TEXT NOT NULL CHECK ("request_type" IN ('connection', 'application', 'invitation', 'message')),
    "received_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "responded_at" TIMESTAMPTZ,
    "is_ignored" BOOLEAN NOT NULL DEFAULT false,
    
    -- Used to limit impact of very old behavior
    "recorded_window" DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS response_metrics_user_idx ON "public"."response_metrics" ("user_id");
CREATE INDEX IF NOT EXISTS response_metrics_window_idx ON "public"."response_metrics" ("recorded_window");

-- RLS Policies for response_metrics
ALTER TABLE "public"."response_metrics" ENABLE ROW LEVEL SECURITY;

-- Metrics can only be read by the system (for aggregation) or the user themselves (if we want to show them their own stats privately)
CREATE POLICY "Users can view their own response metrics" 
    ON "public"."response_metrics" FOR SELECT 
    USING (auth.uid() = user_id);

-- Add withdrawal_reason to collaboration_records
ALTER TABLE "public"."collaboration_records" ADD COLUMN IF NOT EXISTS "withdrawal_reason" TEXT;

