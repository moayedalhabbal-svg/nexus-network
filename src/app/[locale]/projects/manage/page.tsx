"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SEED_PROJECTS, SEED_USERS } from "@/lib/seed-data";
import { FolderKanban, Users, Check, X } from "lucide-react";

// Mock Applications Data
const MOCK_APPLICATIONS = [
  { id: "app-1", projectId: "proj-1", applicantId: "user-2", role: "Full-Stack Engineer", message: "I love what you're doing with climate tech and robotics. I have extensive experience building scalable backends and would love to help get the MVP out the door.", status: "pending", score: 92 },
  { id: "app-2", projectId: "proj-1", applicantId: "user-5", role: "AI Researcher", message: "My recent paper on autonomous navigation directly applies to the problems you're trying to solve. Let's connect.", status: "pending", score: 88 },
];

export default function ManageProjectsPage() {
  const { user, isAuthenticated, loginAsDemo } = useAuth();
  const [apps, setApps] = useState(MOCK_APPLICATIONS);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 text-center shadow-xl">
            <CardHeader>
              <CardTitle>Sign in to manage projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => loginAsDemo()} className="w-full">Try Demo Mode</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Find projects owned by the user
  const myProjects = SEED_PROJECTS.filter(p => p.ownerId === user.id);
  
  // For demo, if they don't own any, we just show proj-1 to give them a taste of the UI
  const displayProjects = myProjects.length > 0 ? myProjects : [SEED_PROJECTS[0]];

  const handleAction = (appId: string, action: "accept" | "reject") => {
    setApps(apps.map(a => a.id === appId ? { ...a, status: action } : a));
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Projects</h1>
              <p className="text-muted-foreground">Review applications and manage your team.</p>
            </div>
            <Link href="/projects/new">
              <Button>Create New Project</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Project List Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Your Projects</h3>
              {displayProjects.map(project => (
                <Card key={project.id} className="border-primary bg-primary/5 shadow-sm">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-1">{project.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{project.pitch}</p>
                    <div className="flex justify-between items-center text-xs">
                      <Badge variant="secondary" className="bg-background">{project.stage}</Badge>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {project.team.length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Applications List */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Pending Applications</CardTitle>
                  <CardDescription>People who want to join your active projects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {apps.map(app => {
                    const applicant = SEED_USERS.find(u => u.id === app.applicantId);
                    const project = SEED_PROJECTS.find(p => p.id === app.projectId);
                    if (!applicant || !project) return null;

                    return (
                      <div key={app.id} className="border rounded-xl p-5 hover:border-primary/30 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                              <Avatar size="lg" alt={applicant.name} />
                              <div>
                                <h4 className="font-bold text-lg">{applicant.name}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{applicant.headline}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {applicant.skills.slice(0, 3).map(skill => (
                                    <Badge key={skill.id} variant="secondary" className="text-[10px]">{skill.name}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <p className="text-sm italic text-muted-foreground">&quot;{app.message}&quot;</p>
                            </div>
                          </div>
                          
                          <div className="w-full md:w-64 shrink-0 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold">Applying for:</span>
                                <Badge variant="outline" className="text-xs">{app.role}</Badge>
                              </div>
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-semibold">AI Match Score:</span>
                                <Badge className="bg-primary/10 text-primary border-primary/20">{app.score}%</Badge>
                              </div>
                            </div>
                            
                            {app.status === "pending" ? (
                              <div className="flex gap-2">
                                <Button onClick={() => handleAction(app.id, "accept")} className="flex-1 bg-green-600 hover:bg-green-700">
                                  <Check className="h-4 w-4 me-2" /> Accept
                                </Button>
                                <Button onClick={() => handleAction(app.id, "reject")} variant="outline" className="flex-1 text-destructive hover:bg-destructive/10">
                                  <X className="h-4 w-4 me-2" /> Decline
                                </Button>
                              </div>
                            ) : (
                              <Button disabled variant="outline" className={`w-full ${app.status === 'accept' ? 'text-green-600' : 'text-destructive'}`}>
                                {app.status === 'accept' ? 'Accepted' : 'Declined'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {apps.length === 0 && (
                    <div className="text-center py-12">
                      <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No pending applications</h3>
                      <p className="text-muted-foreground text-sm">When users apply to your projects, they will appear here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
