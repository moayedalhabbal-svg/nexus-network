"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, Users, CheckSquare, Target, 
  FileText, MessageSquare, ArrowLeft, Loader2, UserPlus, Trophy
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

const WORKSPACE_NAV = [
  { name: "Overview", href: "", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Milestones", href: "/milestones", icon: Target },
  { name: "Team", href: "/team", icon: Users },
  { name: "Recruit", href: "/recruit", icon: UserPlus },
  { name: "Bounties", href: "/bounties", icon: Trophy },
  { name: "Files", href: "/files", icon: FileText },
  { name: "Discussion", href: "/discussion", icon: MessageSquare },
];

export default function WorkspaceLayoutClient({ 
  children, 
  projectId,
  locale
}: { 
  children: React.ReactNode, 
  projectId: string,
  locale: string
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    async function loadWorkspace() {
      if (!isAuthenticated || !user) {
        router.push(`/${locale}/login`);
        return;
      }

      const supabase = createClient();
      
      // Fetch project details and check membership
      const { data: proj } = await supabase
        .from('projects')
        .select(`
          id, title, owner_id,
          project_members(user_id)
        `)
        .eq('id', projectId)
        .single();

      if (proj) {
        setProject(proj);
        const memberIds = proj.project_members?.map((m: any) => m.user_id) || [];
        if (proj.owner_id === user.id || memberIds.includes(user.id)) {
          setIsMember(true);
        }
      }
      setLoading(false);
    }
    
    loadWorkspace();
  }, [projectId, user, isAuthenticated, locale, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/10">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading workspace...</p>
      </div>
    );
  }

  if (!project) {
    return <div className="p-8 text-center text-red-500">Project not found</div>;
  }

  if (!isMember) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/10 p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">You must be a member of this project to view its workspace.</p>
        <Link href={`/${locale}/projects/${projectId}`} className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Return to Project Page
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 border-r bg-muted/20 flex flex-col">
          <div className="p-4 border-b">
            <Link href={`/${locale}/projects/${projectId}`} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
              <ArrowLeft className="h-3 w-3" /> Back to Project
            </Link>
            <h2 className="font-semibold text-lg truncate" title={project.title}>
              {project.title}
            </h2>
            <p className="text-xs text-muted-foreground">Workspace</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {WORKSPACE_NAV.map((item) => {
              const itemPath = `/${locale}/projects/${projectId}/workspace${item.href}`;
              // Exact match for overview, prefix match for others
              const isActive = item.href === "" 
                ? pathname === `/${locale}/projects/${projectId}/workspace`
                : pathname.startsWith(itemPath);
                
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={itemPath}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
