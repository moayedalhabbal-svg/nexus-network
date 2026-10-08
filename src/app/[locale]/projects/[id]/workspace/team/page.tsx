// @ts-nocheck
"use client";
/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, Shield, Check, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { acceptApplicationAction } from "@/app/actions/projects";
import { useParams } from "next/navigation";

export default function WorkspaceTeam() {
  const params = useParams();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [owner, setOwner] = useState<unknown>(null);
  const [members, setMembers] = useState<unknown[]>([]);
  const [applications, setApplications] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    async function loadTeam() {
      if (!params?.id) return;
      const resolvedId = params.id as string;
      setProjectId(resolvedId);
      
      const supabase = createClient();
      
      // Load owner
      const { data: projData } = await supabase
        .from('projects')
        .select('owner_id, profiles!projects_owner_id_fkey(id, full_name, avatar_url, headline)')
        .eq('id', resolvedId)
        .single();
        
      if (projData) {
        setOwner(projData.profiles);
      }

      // Load members
      const { data: memberData } = await supabase
        .from('project_members')
        .select('role, joined_at, profiles(id, full_name, avatar_url, headline)')
        .eq('project_id', resolvedId);
        
      if (memberData) {
        setMembers(memberData);
      }
      
      // Load applications (if owner)
      if (projData?.owner_id === user?.id) {
        const { data: appData } = await supabase
          .from('applications')
          .select('id, message, status, profiles!applications_applicant_id_fkey(id, full_name, avatar_url, headline)')
          .eq('project_id', resolvedId)
          .eq('status', 'pending');
        if (appData) setApplications(appData);
      }
      
      setLoading(false);
    }
    loadTeam();
  }, [params, user]);

  const handleAccept = async (appId: string) => {
    setActionLoading(appId);
    const res = await acceptApplicationAction(appId, "contributor");
    if (res.success) {
      // Reload page to reflect new member
      window.location.reload();
    } else {
      console.error(res.error);
      setActionLoading(null);
    }
  };

  const handleReject = async (appId: string) => {
    setActionLoading(appId);
    const supabase = createClient();
    await supabase.from('applications').update({ status: 'rejected' }).eq('id', appId);
    setApplications(prev => prev.filter(a => a.id !== appId));
    setActionLoading(null);
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">People actively contributing to this project.</p>
        </div>

        <div className="space-y-6">
          {owner && (
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12" alt={owner.full_name} src={owner.avatar_url} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{owner.full_name}</h3>
                      <Badge variant="default" className="bg-primary text-primary-foreground text-[10px] h-5"><Shield className="h-3 w-3 me-1" /> Owner</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{owner.headline}</p>
                  </div>
                </div>
                {owner.id !== user?.id && (
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 me-2" /> Message
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {members.map((m, idx) => (
            <Card key={idx}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12" alt={m.profiles.full_name} src={m.profiles.avatar_url} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{m.profiles.full_name}</h3>
                      <Badge variant="outline" className="capitalize text-[10px] h-5">{m.role.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{m.profiles.headline}</p>
                  </div>
                </div>
                {m.profiles.id !== user?.id && (
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 me-2" /> Message
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          
          {members.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <h3 className="text-lg font-medium text-muted-foreground">No additional members yet</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">When users are accepted into the project, they will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {owner?.id === user?.id && applications.length > 0 && (
        <div className="space-y-6 pt-8 border-t">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Pending Applications</h2>
            <p className="text-muted-foreground mt-1">Review candidates who want to join your project.</p>
          </div>

          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12" alt={app.profiles.full_name} src={app.profiles.avatar_url} />
                      <div>
                        <h3 className="font-semibold text-lg">{app.profiles.full_name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{app.profiles.headline}</p>
                        <div className="bg-muted/30 p-3 rounded-lg text-sm border">
                          <span className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Message:</span>
                          {app.message}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                        onClick={() => handleReject(app.id)}
                        disabled={actionLoading === app.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        className="h-9 w-9 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAccept(app.id)}
                        disabled={actionLoading === app.id}
                      >
                        {actionLoading === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
