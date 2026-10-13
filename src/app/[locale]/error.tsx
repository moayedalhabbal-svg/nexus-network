"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();

  useEffect(() => {
    console.error("Caught runtime boundary error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-zinc-400 mb-6">
          An unexpected error occurred while loading this view. You can reload or return to the main feed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm flex items-center gap-2 justify-center"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
          <Link href={`/${locale}`}>
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm flex items-center gap-2 justify-center w-full"
            >
              <Home className="h-4 w-4" /> Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
