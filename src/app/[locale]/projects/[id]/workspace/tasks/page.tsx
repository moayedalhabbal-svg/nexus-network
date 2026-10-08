/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SEED_WORKSPACE_TASKS, SEED_USERS } from "@/lib/seed-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Clock, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { useParams } from "next/navigation";

export default function WorkspaceTasks() {
  const params = useParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      if (!params?.id) return;
      const supabase = createClient();
      const { data, error } = await supabase.from('project_tasks').select('*').eq('project_id', params.id);
      
      if (error || !data || data.length === 0) {
        // Fallback to seed data for visual testing
        setTasks(SEED_WORKSPACE_TASKS.filter(t => t.projectId === params.id));
      } else {
        setTasks(data);
      }
      setLoading(false);
    }
    loadTasks();
  }, [params]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'Done') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === 'In Progress') return <Clock className="h-4 w-4 text-blue-500" />;
    if (status === 'Blocked') return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  const getAssignee = (id: string) => SEED_USERS.find(u => u.id === id);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage project work items.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New Task</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Todo', 'In Progress', 'Done'].map(statusGroup => (
          <div key={statusGroup} className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">{statusGroup}</h3>
            {tasks.filter(t => t.status === statusGroup || (statusGroup === 'In Progress' && t.status === 'Blocked')).map(task => (
              <Card key={task.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4 space-y-3">
                  <div className="flex gap-2 items-start">
                    <div className="mt-0.5"><StatusIcon status={task.status} /></div>
                    <div className="font-medium text-sm leading-tight">{task.title}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={task.priority === 'High' ? 'border-red-500/50 text-red-500' : ''}>
                      {task.priority}
                    </Badge>
                    {task.assigneeId && (
                      <span className="text-xs text-muted-foreground">{getAssignee(task.assigneeId)?.name?.split(' ')[0]}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
