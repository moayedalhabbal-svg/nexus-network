/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SEED_PROJECTS, SEED_USERS } from "@/lib/seed-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, Check } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function WorkspaceTeam() {
  const params = useParams();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      if (!params?.id) return;
      const resolvedId = params.id as string;
      const supabase = createClient();
      
      const { data, error } = await supabase.from('project_members').select('*').eq('project_id', resolvedId);
      
      if (error || !data || data.length === 0) {
        // Mock fallback
        const proj = SEED_PROJECTS.find(p => p.id === resolvedId);
        if (proj) {
          const owner = SEED_USERS.find(u => u.id === proj.ownerId);
          const members = proj.team.map(t => {
            const u = SEED_USERS.find(u => u.id === t.userId);
            return { ...u, role: t.role };
          });
          setTeam([ { ...owner, role: 'Founder/Owner' }, ...members ].filter(Boolean));
        }
      } else {
        // Normally we'd join with profiles, but for mock we just map userIds
        const members = data.map(m => {
          const u = SEED_USERS.find(u => u.id === m.user_id);
          return { ...u, role: m.role || 'Member' };
        });
        
        const { data: proj } = await supabase.from('projects').select('owner_id').eq('id', resolvedId).single();
        if (proj) {
          const owner = SEED_USERS.find(u => u.id === proj.owner_id);
          setTeam([ { ...owner, role: 'Founder/Owner' }, ...members ].filter(Boolean));
        } else {
          setTeam(members.filter(Boolean));
        }
      }
      setLoading(false);
    }
    loadTeam();
  }, [params]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground mt-1">People collaborating on this project.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {team.map(member => (
          <Link key={member.id} href={`/en/profile/${member.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <Avatar size="lg" alt={member.name} />
                  <div className="space-y-3 flex-1">
                    <div>
                      <h4 className="font-bold text-lg">{member.name}</h4>
                      <Badge variant="outline" className="mt-1 bg-primary/5 text-primary border-primary/20">{member.role}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {member.skills?.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-[10px] bg-muted/50">{skill}</Badge>
                      ))}
                    </div>

                    {member.trustSummary && (
                      <div className="pt-3 border-t border-border/50 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Proof of Work:</span>
                          <span className="font-medium">{member.proofOfWork?.length || 0}</span>
                        </div>
                        {member.trustSummary.reliabilityStatus === 'Reliable Collaborator' && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">Reliability:</span>
                            <span className="text-green-500 font-medium flex items-center gap-1"><Check className="h-3 w-3"/> Reliable</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
