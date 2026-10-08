"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Users, Zap, Briefcase, MapPin, Globe, CheckCircle2, Bot, Check, Loader2, Flag } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

import { getProjectById } from "@/lib/seed-data";
import { matchUserToProject } from "@/lib/matching-engine";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProjectClient({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const params = useParams();
  const locale = params?.locale || "en";
  
  useEffect(() => {
    async function fetchProject() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_owner_id_fkey(full_name, avatar_url, location),
          project_needs(*),
          project_members(*, profiles(full_name, avatar_url))
        `)
        .eq('id', projectId)
        .single();
        
      if (data) {
        // Map to expected UI format
        setProject({
          ...data,
          ownerName: data.profiles?.full_name || 'Unknown',
          ownerAvatar: data.profiles?.avatar_url || '',
          location: data.profiles?.location || 'Remote',
          milestones: [], // Mock or omit for now
          technologies: [], // Mock or omit
          fundingStatus: data.fundingStatus || 'bootstrapped',
          remote: data.remote ?? true,
          team: data.project_members?.map((m: any) => ({
            id: m.id,
            name: m.profiles?.full_name || 'Unknown',
            avatar: m.profiles?.avatar_url || '',
            role: m.role || 'Member'
          })) || [],
          needs: data.project_needs?.map((n: any) => ({
            id: n.id,
            role: n.role_title,
            commitment: n.commitment,
            compensation: 'equity', // Mock for now
            collaboration: 'remote', // Mock for now
            requiredSkills: [] // Mock for now
          })) || []
        });
      } else {
        // Fallback to seed data if not found (for legacy testing)
        setProject(getProjectById(projectId) || getProjectById("proj-1"));
      }
      setLoading(false);
    }
    fetchProject();
  }, [projectId]);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const handleJoinClick = () => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    setMatchResult(matchUserToProject(user, project as any));

    setShowJoinModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/10">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return <div className="p-8 text-center text-red-500">Project not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Header Hero */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-12">
            <Link href="/discover" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Discover
            </Link>
            
            <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
              <div className="max-w-3xl">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="capitalize border-primary/20 text-primary bg-primary/5">
                    {project.category.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    Stage: {project.stage.replace('_', ' ')}
                  </Badge>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{project.title}</h1>
                <p className="text-xl text-muted-foreground mb-6">{project.pitch}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {project.location}
                  </div>
                  {project.remote && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Remote allowed
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 capitalize" /> {project.fundingStatus.replace('_', ' ')}
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-auto shrink-0 space-y-4">
                {user && ((project.owner_id || project.ownerId) === user.id || project.team.some((m: any) => m.id === user.id)) ? (
                  <Link href={`/${locale}/projects/${projectId}/workspace`} className="w-full">
                    <Button size="lg" className="w-full h-12 text-base shadow-lg bg-primary">
                      Open Workspace
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" className="w-full h-12 text-base shadow-lg" onClick={handleJoinClick}>
                    Join Project
                  </Button>
                )}
                <div className="flex -space-x-2 justify-center">
                  {project.team.map((member: any) => (
                    <Avatar key={member.id} alt={member.name} src={member.avatar} className="border-2 border-background" />
                  ))}
                  <div className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                    +{project.team.length}
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">Active team members</p>
                <div className="flex justify-center mt-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                    <Flag className="h-4 w-4 mr-2" /> Report Project
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-2xl font-semibold mb-6">About the project</h2>
                <div className="prose dark:prose-invert max-w-none space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">The Problem</h3>
                    <p className="text-muted-foreground">{project.problem}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">The Solution</h3>
                    <p className="text-muted-foreground">{project.solution}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Overview</h3>
                    <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">Current Progress</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">What exists already?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{project.whatExists}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">What is needed?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{project.whatNeeded}</p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Technologies */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: any) => (
                    <Badge key={tech} variant="secondary">{tech}</Badge>
                  ))}
                </div>
              </section>
              
              {/* Milestones */}
              <section>
                <h2 className="text-xl font-semibold mb-6">Milestones</h2>
                <div className="space-y-4">
                  {project.milestones.map((milestone: any, idx: number) => (
                    <div key={milestone.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${milestone.completed ? 'bg-primary text-primary-foreground' : 'bg-muted border'}`}>
                          {milestone.completed ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs">{idx + 1}</span>}
                        </div>
                        {idx !== project.milestones.length - 1 && <div className="w-px h-full bg-border my-2" />}
                      </div>
                      <div className="pb-6">
                        <h4 className={`font-medium ${milestone.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">Target: {formatDate(milestone.targetDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Needs / Roles */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" /> Open Roles
                </h3>
                <div className="grid gap-4">
                  {project.needs.map((need: any) => (
                    <Card key={need.id} className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{need.role}</CardTitle>
                          <Badge variant="outline" className="text-xs capitalize bg-background">{need.compensation.replace('_', ' ')}</Badge>
                        </div>
                        <CardDescription className="text-xs mt-1">
                          {need.commitment.replace('_', ' ')} • {need.collaboration}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1.5">
                          {need.requiredSkills.map((skill: any) => (
                            <Badge key={skill} variant="secondary" className="text-[10px]">{skill}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Team */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" /> The Team
                </h3>
                <div className="grid gap-4">
                  {project.team.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                      <Avatar alt={member.name} src={member.avatar} />
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      {/* Join Project Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl shadow-2xl animate-fade-in-up">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex justify-between items-center mb-2">
                <CardTitle>Join {project.title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowJoinModal(false)}>✕</Button>
              </div>
              <CardDescription>AI has evaluated your profile against this project's needs.</CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              {matchResult ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3">
                      <Bot className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-bold text-lg text-primary">AI Match Analysis</h4>
                        <p className="text-sm text-primary/80">Based on your skills and intent</p>
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-primary">{matchResult.score}%</div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Why you're a fit</h4>
                    <div className="grid gap-3">
                      {matchResult.reasons.map((reason: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <Check className="h-5 w-5 text-green-500 shrink-0" />
                          <span>
                            {reason.type === 'complementary' ? <strong className="font-medium">{reason.label}</strong> : reason.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Application details</h4>
                    <textarea 
                      className="w-full h-32 p-3 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Introduce yourself and explain how you'd like to contribute..."
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center gap-4">
                    <Bot className="h-8 w-8 text-primary animate-bounce" />
                    <p className="text-muted-foreground font-medium">Analyzing match compatibility...</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 bg-muted/10 justify-end gap-3">
              <Button variant="outline" onClick={() => setShowJoinModal(false)}>Cancel</Button>
              <Button disabled={!matchResult} onClick={async () => {
                const { submitApplicationAction } = await import('@/app/actions/projects');
                // The textarea value should technically be tracked in state, but for now we simulate
                const result = await submitApplicationAction(project.id, project.needs[0]?.id || "demo-need", "Here is my application pitch...");
                if (result.success) {
                  setShowJoinModal(false);
                  alert("Application submitted successfully!");
                } else {
                  alert("Failed to submit: " + result.error);
                }
              }}>Submit Application</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
