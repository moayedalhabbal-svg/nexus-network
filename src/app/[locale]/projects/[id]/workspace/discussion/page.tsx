/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SEED_WORKSPACE_DISCUSSIONS, SEED_USERS } from "@/lib/seed-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useParams } from "next/navigation";

export default function WorkspaceDiscussion() {
  const params = useParams();
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiscussions() {
      if (!params?.id) return;
      const supabase = createClient();
      const { data, error } = await supabase.from('project_discussions').select('*').eq('project_id', params.id).order('created_at', { ascending: true });
      
      if (error || !data || data.length === 0) {
        setDiscussions(SEED_WORKSPACE_DISCUSSIONS.filter(d => d.projectId === params.id));
      } else {
        setDiscussions(data);
      }
      setLoading(false);
    }
    loadDiscussions();
  }, [params]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  const parents = discussions.filter(d => !d.parentId);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discussion</h1>
        <p className="text-muted-foreground mt-1">Project-specific communication.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {parents.map(parent => {
          const author = SEED_USERS.find(u => u.id === parent.authorId);
          const replies = discussions.filter(d => d.parentId === parent.id);
          
          return (
            <div key={parent.id} className="space-y-4">
              <div className="flex gap-4">
                <Avatar alt={author?.name} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm">{author?.name}</span>
                    <span className="text-xs text-muted-foreground">{new Date(parent.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm bg-muted/30 p-3 rounded-lg rounded-tl-none">{parent.content}</p>
                </div>
              </div>
              
              {replies.map(reply => {
                const replyAuthor = SEED_USERS.find(u => u.id === reply.authorId);
                return (
                  <div key={reply.id} className="flex gap-4 ml-12">
                    <Avatar alt={replyAuthor?.name} size="sm" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-xs">{replyAuthor?.name}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(reply.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm bg-muted/10 p-2 rounded-lg rounded-tl-none">{reply.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      
      <div className="mt-auto border-t pt-4 flex gap-2">
        <input type="text" placeholder="Start a new discussion..." className="flex-1 bg-muted/50 border-none rounded-md px-4 text-sm" />
        <Button><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
