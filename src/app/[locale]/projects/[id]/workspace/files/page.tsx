/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SEED_WORKSPACE_FILES } from "@/lib/seed-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, File as FileIcon, FileText } from "lucide-react";
import { useParams } from "next/navigation";

export default function WorkspaceFiles() {
  const params = useParams();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      if (!params?.id) return;
      const supabase = createClient();
      const { data, error } = await supabase.from('project_files').select('*').eq('project_id', params.id);
      
      if (error || !data || data.length === 0) {
        setFiles(SEED_WORKSPACE_FILES.filter(f => f.projectId === params.id));
      } else {
        setFiles(data);
      }
      setLoading(false);
    }
    loadFiles();
  }, [params]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Files & Resources</h1>
          <p className="text-muted-foreground mt-1">Project documents and assets.</p>
        </div>
        <Button><Upload className="h-4 w-4 mr-2" /> Upload File</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map(file => (
          <Card key={file.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex gap-4 items-start">
              <div className="p-3 rounded-lg bg-primary/10">
                {file.fileType === 'application/pdf' ? <FileText className="h-6 w-6 text-primary" /> : <FileIcon className="h-6 w-6 text-primary" />}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-semibold text-sm truncate" title={file.fileName}>{file.fileName}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{file.description}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(file.uploadedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
