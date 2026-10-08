"use client";
import { Target } from "lucide-react";
export default function WorkspaceMilestones() {
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Target className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold">Project Milestones</h1>
      <p className="text-muted-foreground mt-2 max-w-md">Define key objectives and track your project&apos;s major phases. This feature is rolling out soon.</p>
    </div>
  );
}
