"use client";
/* eslint-disable */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEED_USERS } from "@/lib/seed-data";
import { Avatar } from "@/components/ui/avatar";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const { loginAction } = await import("@/app/actions/auth");
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      
      const result = await loginAction(formData);
      if (result.success) {
        // We still call the client login to populate the mock UI state 
        // since we haven't stripped out SEED_USERS yet
        await login(email, password);
        router.push("/discover");
      } else {
        setError(result.error || "Failed to login.");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (userId: string) => {
    loginAsDemo(userId);
    router.push("/discover");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="font-extrabold text-lg text-primary-foreground">N</span>
          </div>
          <span className="font-bold text-2xl tracking-tight">NEXUS</span>
        </Link>

        <Card className="shadow-2xl border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account or try a demo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
              )}
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-4 border-t pt-6">
            <p className="text-xs text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link href="/onboarding" className="text-primary hover:underline font-medium">
                Join the Network
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Demo Quick Login */}
        <Card className="mt-6 shadow-lg border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Quick Demo Login</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Pick a persona to explore NEXUS as a real user
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {SEED_USERS.slice(0, 6).map(user => (
              <button
                key={user.id}
                onClick={() => handleDemoLogin(user.id)}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/30 transition-all text-left group"
              >
                <Avatar size="sm" alt={user.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.headline}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
