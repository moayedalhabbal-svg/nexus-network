/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { UserProfile } from "@/lib/types";
import { SEED_USERS, CURRENT_USER } from "@/lib/seed-data";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsDemo: (userId?: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DEMO_SESSION_COOKIE = "nexus-demo-user-id";
const DEMO_AUTH_KEY = "nexus-auth";

function persistDemoSession(userId: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_SESSION_COOKIE}=${userId}; path=/; max-age=2592000; SameSite=Lax`;
}

function clearDemoSession() {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

function writeDemoUser(user: UserProfile | null) {
  if (typeof document === "undefined") return;
  if (!user) {
    localStorage.removeItem(DEMO_AUTH_KEY);
    return;
  }
  localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(user));
}

function readDemoUser(): UserProfile | null {
  if (typeof document === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEMO_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.id) return parsed as UserProfile;
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSupabaseUser = async () => {
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Fetch profile
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        const { data: powData } = await supabase
          .from('proof_of_work')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false });

          if (!profile) {
            // Profile missing (migration skipped or trigger failed)
            const { ensureProfileAction } = await import("@/app/actions/profile");
            await ensureProfileAction();
            
            // Re-fetch profile
            const { data: retryProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single();
              
            if (retryProfile) {
              profile = retryProfile;
            } else {
              // Create a dummy profile object for the session to work
              profile = {
                full_name: authUser.user_metadata?.full_name || 'NEXUS User',
                search_visibility: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            }
          }

          if (profile) {
            const userName =
              profile.full_name?.trim() ||
              authUser.user_metadata?.full_name?.trim() ||
              (authUser.email ? authUser.email.split('@')[0] : '') ||
              'NEXUS Member';

            setUser({
              id: authUser.id,
              email: authUser.email || '',
              name: userName,
              headline: profile.headline || '',
              bio: profile.bio || '',
              avatar: profile.avatar_url || '',
              location: profile.location || 'Remote',
              timezone: profile.timezone || '',
              roles: Array.isArray(profile.roles) ? profile.roles : [],
              skills: Array.isArray(profile.skills) ? profile.skills : [],
              interests: Array.isArray(profile.interests) ? profile.interests : [],
              intents: Array.isArray(profile.intents) ? profile.intents : [],
              availability: profile.availability || 'flexible',
              collaborationPreferences: Array.isArray(profile.collaboration_preferences) ? profile.collaboration_preferences : [],
              preferredTeamSize: profile.preferred_team_size || '',
              experience: Array.isArray(profile.experience) ? profile.experience : [],
              education: Array.isArray(profile.education) ? profile.education : [],
              proofOfWork: powData ? powData.map((p: any) => ({
                id: p.id,
                userId: p.user_id,
                type: p.type || 'project',
                title: p.title || 'Untitled',
                url: p.url || '',
                description: p.description || '',
                source: p.source || '',
                skills: Array.isArray(p.skills) ? p.skills : [],
                verificationStatus: p.verification_status || 'unverified',
                createdAt: p.created_at || new Date().toISOString(),
                updatedAt: p.updated_at || new Date().toISOString()
              })) : [],
              verifications: [],
              profileVisibility: profile.profile_visibility || 'public',
              searchVisibility: typeof profile.search_visibility === 'boolean' ? profile.search_visibility : true,
              onlineStatus: 'online',
              completionPercentage: profile.completion_percentage || 100,
              joinedAt: profile.created_at || new Date().toISOString(),
              updatedAt: profile.updated_at || new Date().toISOString()
            });
            setIsDemoMode(false);
            setLoading(false);
            return true;
          }
      }
    } catch (e) {
      console.error("Auth context error:", e);
    }
    return false;
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      // 1. Try Supabase first
      const hasSupabase = await fetchSupabaseUser();
      
      if (!hasSupabase && mounted) {
        // 2. Fallback to localStorage demo data
        const stored = localStorage.getItem(DEMO_AUTH_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const seedUser = parsed?.userId ? SEED_USERS.find(u => u.id === parsed.userId) : null;
            const persistedUser = parsed?.id ? (parsed as UserProfile) : seedUser;
            if (persistedUser) {
              setUser(persistedUser);
              setIsDemoMode(true);
              persistDemoSession(persistedUser.id);
            }
          } catch { /* ignore */ }
        }
        setLoading(false);
      }
    };
    init();
    
    // Auth listener
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'SIGNED_IN') {
        fetchSupabaseUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsDemoMode(false);
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // If we just logged in via Supabase action, the onAuthStateChange will catch it.
    // We just manually re-fetch here to be safe and fast.
    const hasSupabase = await fetchSupabaseUser();
    if (hasSupabase) return true;
    
    // Demo mode fallback
    const found = SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      setIsDemoMode(true);
      writeDemoUser(found);
      return true;
    }
    return false;
  }, []);

  const loginAsDemo = useCallback((userId?: string) => {
    const target = userId ? SEED_USERS.find(u => u.id === userId) : CURRENT_USER;
    if (target) {
      setUser(target);
      setIsDemoMode(true);
      writeDemoUser(target);
      persistDemoSession(target.id);
    }
  }, []);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsDemoMode(false);
    writeDemoUser(null);
    clearDemoSession();
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      writeDemoUser(nextUser);
      return nextUser;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchSupabaseUser();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isDemoMode,
      loading,
      login,
      loginAsDemo,
      logout,
      updateProfile,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
