"use client";

import { useEffect, useState } from "react";
import { checkGithubConnectionAction } from "@/app/actions/github";
import { Badge } from "@/components/ui/badge";
import { GitBranch, CheckCircle2 } from "lucide-react";

export function GithubStatusBadge() {
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    checkGithubConnectionAction().then(res => {
      if (res.connected) setConnected(true);
    });
  }, []);

  if (!connected) return null;

  return (
    <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20 mb-4 px-3 py-1">
      <GitBranch className="h-3 w-3" /> GitHub Connected <CheckCircle2 className="h-3 w-3 ml-1" />
    </Badge>
  );
}
