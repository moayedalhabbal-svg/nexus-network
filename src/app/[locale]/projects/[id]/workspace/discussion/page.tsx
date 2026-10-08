"use client";
import { MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

export default function WorkspaceDiscussion() {
  const params = useParams();
  
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold">Project Discussion</h1>
      <p className="text-muted-foreground mt-2 max-w-md mb-6">Discussions happen in the main NEXUS Messages app. When you join a project, a group conversation is automatically created.</p>
      <Link href={`/${params.locale}/messages`}>
        <Button>Open Messages <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </Link>
    </div>
  );
}
