"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Activity, CheckSquare, Users, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function WorkspaceOverview() {
  const params = useParams();
  const [stats, setStats] = useState({ tasks: 0, members: 0, updates: 0 });
  const [loading, setLoading] = useState(true);
  const [showReminder, setShowReminder] = useState(true);

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
