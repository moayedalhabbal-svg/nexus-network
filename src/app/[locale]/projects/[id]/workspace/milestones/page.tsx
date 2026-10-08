/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SEED_WORKSPACE_MILESTONES } from "@/lib/seed-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Target, CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function WorkspaceMilestones() {
  const params = useParams();
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMilestones() {
      if (!params?.id) return;
      const supabase = createClient();
      const { data, error } = await supabase.from('project_milestones').select('*').eq('project_id', params.id).order('target_date', { ascending: true });
      
      if (error || !data || data.length === 0) {
        setMilestones(SEED_WORKSPACE_MILESTONES.filter(m => m.projectId === params.id));
      } else {
        setMilestones(data);
      }
      setLoading(false);
    }
    loadMilestones();
  }, [params]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Milestones</h1>
          <p className="text-muted-foreground mt-1">Key project deliverables.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New Milestone</Button>
      </div>

      <div className="space-y-4">
        {milestones.map(milestone => (
          <Card key={milestone.id} className={milestone.status === 'Done' ? 'opacity-70 bg-muted/30' : ''}>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {milestone.status === 'Done' ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <Target className="h-8 w-8 text-primary/50" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{milestone.title}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>Due: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <Badge variant={milestone.status === 'Done' ? 'secondary' : 'default'}>
                {milestone.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
