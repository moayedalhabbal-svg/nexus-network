"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SEED_PROJECTS } from "@/lib/seed-data";
import { matchUserToProject } from "@/lib/matching-engine";
import {
  Search, Plus, SlidersHorizontal, MapPin, Globe, Users,
  FolderKanban, Sparkles,
} from "lucide-react";
import type { ProjectCategory } from "@/lib/types";

const CATEGORIES = [
  "all", "ai", "climate", "healthcare", "education", "fintech",
  "robotics", "biotech", "social_impact", "mobility", "agriculture",
];

const STAGES = ["all", "idea", "prototype", "mvp", "beta", "launched", "scaling"];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [realProjects, setRealProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { getAllProjectsAction } = await import("@/app/actions/projects");
        const res = await getAllProjectsAction();
        if (res.success && res.projects) {
          setRealProjects(res.projects);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const baseProjects = realProjects.length > 0 ? realProjects : (!loading ? SEED_PROJECTS : []);

  const filtered = baseProjects.filter(p => {
    // Handle differences between DB structure and SEED_PROJECTS
    const cats = p.categories || (p.category ? [p.category] : []);
    const techs = p.technologies || [];
    
    if (selectedCategory !== "all" && !cats.includes(selectedCategory as ProjectCategory)) return false;
    if (selectedStage !== "all" && p.stage !== selectedStage) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.pitch?.toLowerCase().includes(q) ||
        techs.some((t: string) => t.toLowerCase().includes(q)) ||
        cats.some((c: string) => c.includes(q))
      );
    }
    return true;
  });

  const projectsWithMatch = filtered.map(p => {
    // Safely coerce DB structure into what matchUserToProject expects
    const safeProject = {
      ...p,
      technologies: p.technologies || [],
      needs: p.needs || [],
      categories: p.categories || (p.category ? [p.category] : [])
    };
    
    return {
      ...p,
      matchScore: user ? matchUserToProject(user as any, safeProject as any).score : null,
    };
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      idea: "bg-purple-500/10 text-purple-500",
      prototype: "bg-yellow-500/10 text-yellow-600",
      mvp: "bg-blue-500/10 text-blue-500",
      beta: "bg-cyan-500/10 text-cyan-600",
      launched: "bg-green-500/10 text-green-500",
      scaling: "bg-emerald-500/10 text-emerald-500",
    };
    return colors[stage] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <FolderKanban className="h-8 w-8 text-primary" />
                Projects
              </h1>
              <p className="text-muted-foreground">
                Discover projects that need your skills. {projectsWithMatch.length} active projects.
              </p>
            </div>
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  className="ps-9"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              <Link href="/projects/new">
                <Button className="gap-2 hidden sm:flex">
                  <Plus className="h-4 w-4" /> Create Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mb-6 p-4 rounded-xl border bg-card animate-fade-in space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium capitalize transition-all ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      {cat === "all" ? "All Categories" : cat.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Stage</label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map(stage => (
                    <button
                      key={stage}
                      onClick={() => setSelectedStage(stage)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium capitalize transition-all ${
                        selectedStage === stage
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      {stage === "all" ? "All Stages" : stage}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projectsWithMatch.map(project => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="flex flex-col h-full hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="outline" className="capitalize text-xs">{(project.category || (project.categories && project.categories[0]) || 'Project').replace("_", " ")}</Badge>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStageColor(project.stage)} border-transparent capitalize text-xs`}>
                          {project.stage}
                        </Badge>
                        {project.matchScore !== null && project.matchScore > 50 && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs" variant="outline">
                            <Sparkles className="h-3 w-3 me-1" />
                            {project.matchScore}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 font-medium">{project.pitch}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 pb-4 space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(project.technologies || []).slice(0, 4).map((tech: string) => (
                        <Badge key={tech} variant="secondary" className="text-[10px]">{tech}</Badge>
                      ))}
                      {(project.technologies || []).length > 4 && (
                        <Badge variant="secondary" className="text-[10px] border-dashed">+{(project.technologies || []).length - 4}</Badge>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Open Roles</p>
                      <div className="flex flex-wrap gap-1.5">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(project.needs || []).filter((n: any) => !n.filled).map((need: any) => (
                          <Badge key={need.id} variant="outline" className="text-xs bg-primary/5 border-primary/20">
                            {need.role || need.role_title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t pt-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar size="sm" alt={project.profiles?.full_name || project.ownerName || "Owner"} src={project.profiles?.avatar_url} />
                      <span className="text-xs text-muted-foreground">{project.profiles?.full_name || project.ownerName || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {project.team ? project.team.length : 1}
                      </span>
                      <span className="flex items-center gap-1">
                        {project.remote !== false ? <Globe className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                        {project.remote !== false ? "Remote" : (project.location || "On-site")}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          {projectsWithMatch.length === 0 && (
            <div className="text-center py-20">
              <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
