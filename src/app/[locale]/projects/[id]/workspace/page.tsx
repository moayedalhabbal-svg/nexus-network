"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Activity, CheckSquare, Users } from "lucide-react";
import { useParams } from "next/navigation";

export default function WorkspaceOverview() {
  const params = useParams();
  const [stats, setStats] = useState({ tasks: 0, members: 0, updates: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!params?.id) return;
      const resolvedId = params.id as string;
      
      const supabase = createClient();
      
      const { count: taskCount } = await supabase.from('project_tasks').select('*', { count: 'exact', head: true }).eq('project_id', resolvedId);
      const { count: memberCount } = await supabase.from('project_members').select('*', { count: 'exact', head: true }).eq('project_id', resolvedId);
      
      setStats({
        tasks: taskCount || 0,
        members: (memberCount || 0) + 1, // +1 for owner
        updates: 0 // Mock for now
      });
      setLoading(false);
    }
    loadStats();
  }, [params]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Project activity and quick metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Open items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.members}</div>
            <p className="text-xs text-muted-foreground mt-1">Collaborators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.updates}</div>
            <p className="text-xs text-muted-foreground mt-1">Updates this week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events in your project workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            No recent activity to show.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
