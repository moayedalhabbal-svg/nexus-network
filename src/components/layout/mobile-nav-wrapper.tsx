"use client";

import { useAuth } from "@/lib/auth-context";
import { MobileNav } from "./mobile-nav";

export function MobileNavWrapper() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return <MobileNav />;
}
