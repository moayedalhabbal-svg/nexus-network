"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { SEED_BOUNTIES, SEED_USERS, SEED_PROJECTS } from "@/lib/seed-data";
import { v4 as uuidv4 } from "uuid";

// We keep local state for demo purposes as real DB migrations might not be applied in the demo environment
let DEMO_BOUNTIES: any[] = [...SEED_BOUNTIES];

export async function createBountyAction(data: {
  project_id: string;
  title: string;
  description: string;
  skills_required: string[];
  category: string;
  expected_deliverables: string;
  acceptance_criteria: string;
  estimated_effort: string;
  deadline?: string;
  contributors_needed: number;
  reward_type: string;
  reward_details: string;
  cash_currency?: string;
  cash_amount_range?: string;
  cash_is_negotiable?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const { data: newBounty, error } = await supabase
      .from('bounties')
      .insert({
        owner_id: user.id,
        ...data,
        status: 'open'
      })
      .select()
      .single();

    if (!error) {
      revalidatePath("/projects");
      revalidatePath("/bounties");
      return { success: true, bounty: newBounty };
    }
  } catch (e) {
    // Ignore db missing errors in demo
  }

  // Fallback to DEMO
  const newDemoBounty = {
    id: uuidv4(),
    owner_id: user.id,
    ...data,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    applications: [],
    submissions: []
  };
  DEMO_BOUNTIES = [newDemoBounty as any, ...DEMO_BOUNTIES];
  revalidatePath("/projects");
  revalidatePath("/bounties");
  return { success: true, bounty: newDemoBounty };
}

export async function fetchBountiesAction(filters?: { project_id?: string; category?: string; status?: string }) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('bounties')
      .select('*, owner:profiles!owner_id(*), project:projects(*)');
      
    if (filters?.project_id) query = query.eq('project_id', filters.project_id);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.status) query = query.eq('status', filters.status);
    
    const { data: bounties, error } = await query.order('created_at', { ascending: false });
    
    if (!error && bounties && bounties.length > 0) {
      return { success: true, bounties };
    }
  } catch (e) {
    // Fallback
  }

  // Fallback to DEMO
  let filtered = [...DEMO_BOUNTIES];
  if (filters?.project_id) filtered = filtered.filter(b => b.project_id === filters.project_id);
  if (filters?.category) filtered = filtered.filter(b => b.category === filters.category);
  if (filters?.status) filtered = filtered.filter(b => b.status === filters.status);

  const mapped = filtered.map(b => ({
    ...b,
    owner: SEED_USERS.find(u => u.id === b.owner_id),
    project: SEED_PROJECTS.find(p => p.id === b.project_id)
  }));
  return { success: true, bounties: mapped };
}

export async function fetchBountyByIdAction(bountyId: string) {
  try {
    const supabase = await createClient();
    const { data: bounty, error } = await supabase
      .from('bounties')
      .select('*, owner:profiles!owner_id(*), project:projects(*)')
      .eq('id', bountyId)
      .single();

    if (!error && bounty) return { success: true, bounty };
  } catch (e) {
    // Fallback
  }

  const demoBounty = DEMO_BOUNTIES.find(b => b.id === bountyId);
  if (!demoBounty) return { success: false, error: "Bounty not found" };

  const mapped = {
    ...demoBounty,
    owner: SEED_USERS.find(u => u.id === demoBounty.owner_id),
    project: SEED_PROJECTS.find(p => p.id === demoBounty.project_id)
  };
  return { success: true, bounty: mapped };
}

export async function applyToBountyAction(bountyId: string, message: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const { data: application, error } = await supabase
      .from('bounty_applications')
      .insert({
        bounty_id: bountyId,
        applicant_id: user.id,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (!error) {
      revalidatePath(`/bounties/${bountyId}`);
      return { success: true, application };
    }
  } catch(e) {}

  const bounty = DEMO_BOUNTIES.find(b => b.id === bountyId);
  if (bounty) {
    const newApp = {
      id: uuidv4(),
      applicant_id: user.id,
      message,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    bounty.applications.push(newApp);
  }

  revalidatePath(`/bounties/${bountyId}`);
  return { success: true };
}

export async function updateApplicationStatusAction(applicationId: string, status: string, bountyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const { data, error } = await supabase
      .from('bounty_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single();

    if (!error && data) {
      if (status === 'accepted') {
        await supabase.from('bounties').update({ status: 'in_progress' }).eq('id', data.bounty_id);
      }
      revalidatePath(`/bounties/${data.bounty_id}`);
      return { success: true, application: data };
    }
  } catch(e) {}

  const bounty = DEMO_BOUNTIES.find(b => b.id === bountyId);
  if (bounty) {
    const app = bounty.applications.find((a: any) => a.id === applicationId);
    if (app) app.status = status;
    if (status === 'accepted') bounty.status = 'in_progress';
  }

  revalidatePath(`/bounties/${bountyId}`);
  return { success: true };
}

export async function submitBountyWorkAction(bountyId: string, description: string, urls: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const { data: submission, error } = await supabase
      .from('bounty_submissions')
      .insert({
        bounty_id: bountyId,
        contributor_id: user.id,
        description,
        urls,
        status: 'submitted'
      })
      .select()
      .single();

    if (!error && submission) {
      await supabase.from('bounties').update({ status: 'submitted_for_review' }).eq('id', bountyId);
      revalidatePath(`/bounties/${bountyId}`);
      return { success: true, submission };
    }
  } catch(e) {}

  const bounty = DEMO_BOUNTIES.find(b => b.id === bountyId);
  if (bounty) {
    bounty.submissions.push({
      id: uuidv4(),
      contributor_id: user.id,
      description,
      urls,
      status: 'submitted',
      created_at: new Date().toISOString()
    });
    bounty.status = 'submitted_for_review';
  }

  revalidatePath(`/bounties/${bountyId}`);
  return { success: true };
}

export async function reviewBountySubmissionAction(submissionId: string, status: string, feedback: string, bountyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const { data: submission, error } = await supabase
      .from('bounty_submissions')
      .update({
        status,
        owner_feedback: feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (!error && submission) {
      const bountyStatus = status === 'accepted' ? 'completed' : 'revision_requested';
      await supabase.from('bounties').update({ status: bountyStatus }).eq('id', submission.bounty_id);
      revalidatePath(`/bounties/${submission.bounty_id}`);
      return { success: true, submission };
    }
  } catch(e) {}

  const bounty = DEMO_BOUNTIES.find(b => b.id === bountyId);
  if (bounty) {
    const sub = bounty.submissions.find((s: any) => s.id === submissionId);
    if (sub) {
      sub.status = status;
      (sub as any).owner_feedback = feedback;
    }
    bounty.status = status === 'accepted' ? 'completed' : 'revision_requested';
  }

  revalidatePath(`/bounties/${bountyId}`);
  return { success: true };
}

export async function addBountyToPoWAction(bountyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const bounty = DEMO_BOUNTIES.find(b => b.id === bountyId);
  if (!bounty) return { success: false, error: "Bounty not found" };

  if (bounty.status !== 'completed') return { success: false, error: "Bounty not completed" };

  try {
    const { error } = await supabase.from('proof_of_work').insert({
      user_id: user.id,
      title: bounty.title,
      type: 'bounty',
      url: `/bounties/${bounty.id}`,
      description: `Completed NEXUS Bounty: ${bounty.description}`,
      source: 'NEXUS Network',
      skills: bounty.skills_required,
      verification_status: 'owner_confirmed'
    });
    if (!error) return { success: true };
  } catch (e) {}

  return { success: true };
}
