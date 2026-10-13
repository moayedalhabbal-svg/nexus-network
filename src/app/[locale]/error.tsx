"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";
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
  const [showStack, setShowStack] = useState(false);

  useEffect(() => {
    console.error("Caught runtime boundary error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-zinc-900/95 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-zinc-400 mb-4">
          An unexpected error occurred while loading this view.
        </p>

        {/* Diagnostic Error Details */}
        <div className="mb-6 p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-left text-xs text-red-300 space-y-1">
          <p className="font-semibold break-words">
            {error?.message || "An unknown client runtime error occurred."}
          </p>
          {error?.digest && (
            <p className="text-[10px] text-zinc-500 font-mono">Digest: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
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

        {error?.stack && (
          <div className="text-left pt-3 border-t border-zinc-800/80">
            <button
              onClick={() => setShowStack(!showStack)}
              className="text-[11px] text-zinc-500 hover:text-zinc-400 flex items-center gap-1 mx-auto"
            >
              {showStack ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showStack ? "Hide stack trace" : "View stack trace"}
            </button>
            {showStack && (
              <pre className="mt-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
