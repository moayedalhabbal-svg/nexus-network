/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SEED_PROJECTS, SEED_WORKSPACE_MILESTONES, SEED_WORKSPACE_TASKS } from "@/lib/seed-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Activity, CheckSquare, Users, AlertCircle, Target, ArrowRight, UserPlus } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function WorkspaceOverview() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [stats, setStats] = useState({ tasksTotal: 0, tasksDone: 0, members: 0 });
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReminder, setShowReminder] = useState(true);

  useEffect(() => {
    async function loadWorkspace() {
      if (!params?.id) return;
      const resolvedId = params.id as string;
      
      const p = SEED_PROJECTS.find(p => p.id === resolvedId);
      setProject(p || SEED_PROJECTS[0]);

      // Seed fallback for tasks/milestones since they might not be in DB yet
      const projectMilestones = SEED_WORKSPACE_MILESTONES.filter(m => m.projectId === resolvedId);
      const projectTasks = SEED_WORKSPACE_TASKS.filter(t => t.projectId === resolvedId);
      
      setMilestones(projectMilestones);
      
      setStats({
        tasksTotal: projectTasks.length,
        tasksDone: projectTasks.filter(t => t.status === 'Done').length,
        members: (p?.team?.length || 0) + 1
      });
      
      setLoading(false);
    }
    loadWorkspace();
  }, [params]);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const progressPercent = stats.tasksTotal > 0 ? Math.round((stats.tasksDone / stats.tasksTotal) * 100) : 0;
  const nextMilestone = milestones.find(m => m.status !== 'Done') || milestones[0];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      {showReminder && (
        <Card className="border-yellow-500/50 bg-yellow-500/5 shadow-sm">
          <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Your project team is waiting for an update.</p>
                <p className="text-xs text-muted-foreground mt-1">Consistent communication builds your reliability score.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button size="sm" onClick={() => setShowReminder(false)}>Send Update</Button>
              <Button size="sm" variant="outline" onClick={() => setShowReminder(false)}>Adjust Availability</Button>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setShowReminder(false)}>Leave Project</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{project?.title}</h1>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{project?.stage}</Badge>
            </div>
            <p className="text-muted-foreground text-lg">{project?.pitch}</p>
          </div>

          <Card className="bg-muted/30 border-muted">
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Project Progress</p>
                  <h3 className="text-4xl font-bold text-primary">{progressPercent}%</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{stats.tasksDone} of {stats.tasksTotal} tasks completed</p>
                </div>
              </div>
              <div className="h-3 w-full bg-muted overflow-hidden rounded-full">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
              </div>
            </CardContent>
          </Card>

          {nextMilestone && (
            <Card className="border-primary/30 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Milestone</p>
                    <h3 className="font-semibold text-lg">{nextMilestone.title}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p className="font-medium">{new Date(nextMilestone.targetDate).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Activity className="h-4 w-4" /> Project Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="font-semibold text-lg">On Track</span>
              </div>
              <p className="text-xs text-muted-foreground">Milestones are progressing on schedule. No high priority blockers.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" /> Team
              </CardTitle>
              <Link href="./workspace/team" className="text-xs text-primary hover:underline">View All</Link>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.members}</div>
              <p className="text-xs text-muted-foreground mt-1">Active Collaborators</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <UserPlus className="h-4 w-4" /> Recruiting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs mb-3">Looking to expand your team? Use AI to find the perfect collaborators.</p>
              <Button asChild size="sm" className="w-full">
                <Link href="./workspace/recruit">Find Collaborators</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <CheckSquare className="h-4 w-4" /> Open Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.tasksTotal - stats.tasksDone}</div>
              <Link href="./workspace/tasks" className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
                Go to Tasks <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
