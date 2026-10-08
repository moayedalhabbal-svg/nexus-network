"use client";
import { FolderOpen } from "lucide-react";
export default function WorkspaceFiles() {
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold">Project Files</h1>
      <p className="text-muted-foreground mt-2 max-w-md">File management is currently in beta. You will soon be able to upload, organize, and share documents with your team here.</p>
    </div>
  );
}
