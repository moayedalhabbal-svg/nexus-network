import { createClient } from "@/lib/supabase/client";

export type AnalyticsEventType = 
  | 'signup_completed'
  | 'onboarding_completed'
  | 'profile_completed'
  | 'project_created'
  | 'project_viewed'
  | 'project_saved'
  | 'match_viewed'
  | 'match_accepted'
  | 'match_rejected'
  | 'connection_requested'
  | 'connection_accepted'
  | 'message_sent'
  | 'project_application'
  | 'application_accepted'
  | 'application_rejected'
  | 'project_joined'
  | 'research_application'
  | 'mentor_connection'
  | 'opportunity_saved'
  | 'milestone_completed';

export async function trackEvent(
  eventType: AnalyticsEventType, 
  metadata: Record<string, unknown> = {}
) {
  try {
    const supabase = createClient();
    
    // Get current user implicitly from the session if available
    const { data: { user } } = await supabase.auth.getUser();

    // Sanitize metadata to avoid collecting PII if any exists
    const sanitizedMetadata = { ...metadata };
    delete sanitizedMetadata.email;
    delete sanitizedMetadata.phone;
    delete sanitizedMetadata.name;

    await supabase.from('product_analytics_events').insert({
      user_id: user?.id || null,
      event_type: eventType,
      metadata: sanitizedMetadata
    });
  } catch (error) {
    // Fail silently in production, do not break the main app flow
    console.error('Failed to track analytics event:', error);
  }
}
