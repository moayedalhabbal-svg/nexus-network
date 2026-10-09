/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { extractSkillsFromEvidenceAction } from "./evidence";

// Real production URL if configured, otherwise fallback to local mock
const GITHUB_API_BASE = "https://api.github.com";

export async function checkGithubConnectionAction() {
  const isOAuthConfigured = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { connected: false, isOAuthConfigured };

  // For testing purposes, we check if the user is connected via user_providers
  const { data, error } = await supabase
    .from('user_providers')
    .select('provider_username, last_synced_at, access_token')
    .eq('user_id', user.id)
    .eq('provider', 'github')
    .single();

  if (error || !data) return { connected: false, isOAuthConfigured };

  // If the user was connected when OAuth wasn't configured, they lack an access_token.
  const isVerifiedConnection = !!data.access_token;
  
  return { 
    connected: true, 
    username: data.provider_username, 
    lastSyncedAt: data.last_synced_at,
    isOAuthConfigured,
    isVerifiedConnection
  };
}

export async function connectGithubMockAction(username: string) {
  // In production with real OAuth, this is replaced by the OAuth flow.
  // Because we don't have configured Supabase OAuth or GitHub OAuth apps here,
  // we use a safe mock that simulates the end result of a successful OAuth callback
  // which only retrieves public data and requires no secrets.
  
  if (!username) return { success: false, error: "Username required" };
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const isOAuthConfigured = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  if (isOAuthConfigured) {
    // Return a message that OAuth should be used, or we could initiate the OAuth URL here.
    // For this implementation, we would typically redirect to GitHub OAuth login.
    const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback&scope=read:user,repo`;
    return { success: true, redirectUrl: oauthUrl };
  }

  try {
    // Verify user exists on GitHub
    const res = await fetch(`\${GITHUB_API_BASE}/users/\${username}`);
    if (!res.ok) throw new Error("GitHub user not found");
    const ghUser = await res.json();

    const { error } = await supabase.from('user_providers').upsert({
      user_id: user.id,
      provider: 'github',
      provider_user_id: String(ghUser.id),
      provider_username: ghUser.login,
      last_synced_at: new Date().toISOString(),
      access_token: null // explicitly null to mark as unverified
    }, { onConflict: 'user_id, provider' });

    if (error) throw error;

    revalidatePath('/[locale]/profile', 'layout');
    return { success: true, username: ghUser.login };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function disconnectGithubAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from('user_providers')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', 'github');

  if (error) return { success: false, error: error.message };

  revalidatePath('/[locale]/profile', 'layout');
  return { success: true };
}

export async function fetchGithubRepositoriesAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: providerData } = await supabase
    .from('user_providers')
    .select('provider_username, access_token')
    .eq('user_id', user.id)
    .eq('provider', 'github')
    .single();

  if (!providerData) return { success: false, error: "GitHub not connected" };

  try {
    // Fetch public repos. In a real OAuth flow with repo scopes, this would pass the access_token
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    };
    if (providerData.access_token) {
      headers['Authorization'] = `token ${providerData.access_token}`;
    }

    const res = await fetch(`\${GITHUB_API_BASE}/users/\${providerData.provider_username}/repos?sort=updated&per_page=30`, {
      headers
    });
    if (!res.ok) throw new Error("Failed to fetch repositories");
    
    const repos = await res.json();

    const mappedRepos = repos.map((repo: any) => ({
      id: String(repo.id),
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      topics: repo.topics || [],
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      isFork: repo.fork,
      updatedAt: repo.updated_at,
      owner: repo.owner.login
    }));

    return { success: true, repositories: mappedRepos };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addGithubEvidenceAction(repositories: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const { data: providerData } = await supabase
      .from('user_providers')
      .select('access_token')
      .eq('user_id', user.id)
      .eq('provider', 'github')
      .single();

    const isVerifiedConnection = !!providerData?.access_token;
    const verificationStatus = isVerifiedConnection ? 'verified' : 'unverified_lookup';
    
    const proofs = [];
    
    for (const repo of repositories) {
      // Use existing skill extraction combining language, topics, and description
      const combinedDescription = `\${repo.description || ''} \${repo.language || ''} \${repo.topics?.join(', ') || ''}`;
      const { skills } = await extractSkillsFromEvidenceAction(repo.name, combinedDescription, repo.url);
      
      const role = repo.isFork ? 'Contributor' : 'Owner';
      const type = 'github';

      const metadata = {
        stars: repo.stars,
        forks: repo.forks,
        language: repo.language,
        topics: repo.topics,
        isFork: repo.isFork,
        role: role
      };

      const { data, error } = await supabase.from('proof_of_work').upsert({
        user_id: user.id,
        title: repo.name,
        type: type,
        url: repo.url,
        description: repo.description || 'GitHub Repository',
        source: 'GitHub',
        skills: skills || [],
        verification_status: verificationStatus,
        provider: 'github',
        provider_id: String(repo.id),
        metadata: metadata
      }, { onConflict: 'user_id, provider, provider_id' }).select().single();

      if (error) throw error;
      proofs.push(data);
    }
    
    revalidatePath('/[locale]/profile', 'layout');
    return { success: true, count: proofs.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeGithubEvidenceAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from('proof_of_work')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/[locale]/profile', 'layout');
  return { success: true };
}
