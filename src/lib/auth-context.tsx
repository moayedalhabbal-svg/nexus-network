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
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        const { data: powData } = await supabase
          .from('proof_of_work')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false });

        if (profile) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: profile.full_name,
            headline: profile.headline || '',
            bio: profile.bio || '',
            avatar: profile.avatar_url || '',
            location: profile.location || 'Remote',
            timezone: profile.timezone || '',
            roles: [],
            skills: [],
            interests: [],
            intents: [],
            availability: 'flexible',
            collaborationPreferences: [],
            preferredTeamSize: '',
            experience: [],
            education: [],
            proofOfWork: powData ? powData.map((p: any) => ({
              id: p.id,
              userId: p.user_id,
              type: p.type,
              title: p.title,
              url: p.url,
              description: p.description,
              source: p.source,
              skills: p.skills || [],
              verificationStatus: p.verification_status,
              createdAt: p.created_at,
              updatedAt: p.updated_at
            })) : [],
            verifications: [],
            profileVisibility: 'public',
            searchVisibility: profile.search_visibility,
            onlineStatus: 'online',
            completionPercentage: 100,
            joinedAt: profile.created_at,
            updatedAt: profile.updated_at
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
        const stored = localStorage.getItem("nexus-auth");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.userId) {
              const found = SEED_USERS.find(u => u.id === parsed.userId);
              if (found) {
                setUser(found);
                setIsDemoMode(true);
              }
            }
          } catch { /* ignore */ }
        }
        setLoading(false);
      }
    };
    init();
    
    // Auth listener
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
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
      localStorage.setItem("nexus-auth", JSON.stringify({ userId: found.id }));
      return true;
    }
    return false;
  }, []);

  const loginAsDemo = useCallback((userId?: string) => {
    const target = userId ? SEED_USERS.find(u => u.id === userId) : CURRENT_USER;
    if (target) {
      setUser(target);
      setIsDemoMode(true);
      localStorage.setItem("nexus-auth", JSON.stringify({ userId: target.id }));
    }
  }, []);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsDemoMode(false);
    localStorage.removeItem("nexus-auth");
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
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
