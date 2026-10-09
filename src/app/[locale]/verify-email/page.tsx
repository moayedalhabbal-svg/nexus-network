"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const router = useRouter();
  const locale = useLocale();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResend = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        setError("Could not find your email address. Please sign in again.");
        setIsLoading(false);
        return;
      }
      
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setIsSuccess(true);
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { logoutAction } = await import("@/app/actions/auth");
    await logoutAction();
    router.push(`/${locale}/login`);
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

        <Card className="shadow-2xl border-border/50 text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
              <Mail className="w-6 h-6 text-blue-500" />
            </div>
            <CardTitle className="text-2xl">Verify your email</CardTitle>
            <CardDescription className="text-base pt-2">
              You need to verify your email address before you can access NEXUS collaboration features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <p className="text-sm text-green-500 bg-green-500/10 px-3 py-2 rounded-md mb-4">
                A new verification email has been sent. Please check your inbox.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mb-6">
                Didn&apos;t receive the email? We can send you another one.
              </p>
            )}
            
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md mb-4">
                {error}
              </p>
            )}
            
            <Button 
              onClick={handleResend} 
              className="w-full mb-3" 
              disabled={isLoading || isSuccess}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? "Sending..." : "Resend Verification Email"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleSignOut} 
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
