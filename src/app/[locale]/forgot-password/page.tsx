"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const { resetPasswordAction } = await import("@/app/actions/auth");
      const formData = new FormData();
      formData.append("email", email);
      
      const result = await resetPasswordAction(formData);
      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error || "Failed to send reset email.");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border-border/50 text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription className="text-base pt-2">
                If an account exists for <span className="font-medium text-foreground">{email}</span>, we have sent a password reset link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                Please check your inbox and follow the instructions to reset your password.
              </p>
              <Link href={`/${locale}/login`}>
                <Button className="w-full">Return to Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Enter your email address and we&apos;ll send you a link to reset your password.</CardDescription>
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
              
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
              )}
              
              <Button type="submit" className="w-full h-11 mt-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-4 border-t pt-6">
            <p className="text-xs text-muted-foreground text-center">
              Remember your password?{" "}
              <Link href={`/${locale}/login`} className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
