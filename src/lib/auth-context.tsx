"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { UserProfile } from "@/lib/types";
import { SEED_USERS, CURRENT_USER } from "@/lib/seed-data";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsDemo: (userId?: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    let mounted = true;
    const stored = localStorage.getItem("nexus-auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.userId) {
          const found = SEED_USERS.find(u => u.id === parsed.userId);
          if (found && mounted) {
            setTimeout(() => {
              setUser(found);
              setIsDemoMode(true);
            }, 0);
          }
        }
      } catch { /* ignore */ }
    }
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Demo mode: find user by email in seed data
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

  const logout = useCallback(() => {
    setUser(null);
    setIsDemoMode(false);
    localStorage.removeItem("nexus-auth");
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isDemoMode,
      login,
      loginAsDemo,
      logout,
      updateProfile,
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
