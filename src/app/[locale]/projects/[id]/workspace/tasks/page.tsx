// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";

export default function WorkspaceTasks() {
  const params = useParams();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    async function loadTasks() {
      if (!params?.id) return;
      const resolvedId = params.id as string;
      setProjectId(resolvedId);
      
      const supabase = createClient();
      const { data } = await supabase
        .from('project_tasks')
        .select('*, profiles!project_tasks_assignee_id_fkey(full_name, avatar_url)')
        .eq('project_id', resolvedId)
        .order('created_at', { ascending: false });
        
      if (data) setTasks(data);
      setLoading(false);
    }
    loadTasks();
  }, [params]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !projectId) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const newTask = {
      project_id: projectId,
      title: newTaskTitle,
      creator_id: user.id,
      status: 'todo',
      priority: 'medium'
    };

    const { data } = await supabase
      .from('project_tasks')
      .insert([newTask])
      .select()
      .single();

    if (data) {
      setTasks([data, ...tasks]);
      setNewTaskTitle("");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const columns = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage project work and track progress.</p>
        </div>
        
        <form onSubmit={addTask} className="flex gap-2">
          <Input 
            placeholder="New task title..." 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            className="w-64"
          />
          <Button type="submit"><Plus className="h-4 w-4 me-2" /> Add Task</Button>
        </form>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col bg-muted/30 rounded-xl border overflow-hidden">
            <div className="p-4 border-b bg-muted/50 font-medium flex justify-between items-center">
              {col.label}
              <Badge variant="secondary">{tasks.filter(t => t.status === col.id).length}</Badge>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {tasks.filter(t => t.status === col.id).map(task => (
                <Card key={task.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 cursor-grab" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        {task.priority !== 'medium' && (
                          <Badge variant="outline" className="mt-2 text-[10px] uppercase">
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="text-center p-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
